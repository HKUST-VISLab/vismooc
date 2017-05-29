import json
import multiprocessing
from datetime import datetime
from functools import partial

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule
from mathematician.text_helper import SentimentAnalyzer
from mathematician.Processor.utils import PARALLEL_GRAIN, get_cpu_num

class ForumProcessor(PipeModule):

    order = 4
    forum_type = {'CommentThread': 'CommentThread', 'Comment': 'Comment'}
    thread_type = {'question': 'Question', 'discussion': 'Discussion'}

    def __init__(self):
        super().__init__()
        self.forums = []
        self.processed_files = []
        self.posts = {}
        self.social = {}
        self.sentiment_analyzer = SentimentAnalyzer()

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        for filename in data_filenames:
            if 'prod.mongo' in filename:
                with open(filename, 'r', encoding='utf-8') as file:
                    raw_data = file.readlines()
                    self.processed_files.append(filename)
                    yield raw_data

    @classmethod
    def process_few_forums(cls, rows, sentiment_analyzer):
        ''' Process one forum item
        '''
        pattern_time = "%Y-%m-%dT%H:%M:%S.%fZ"
        result = []
        for row in rows:
            row = row[:-1]
            row = row.replace('$', '')
            row = json.loads(row)
            post = {}

            post[DBc.FIELD_FORUM_ORIGINAL_ID] = row.get('_id').get('oid')
            post[DBc.FIELD_FORUM_AUTHOR_ID] = row.get('author_id')
            course_id = row.get('course_id')
            if '+' in course_id:
                course_id = course_id[course_id.index(':')+1:].replace('+', '/')
            course_id = course_id.replace('/', '_')
            post[DBc.FIELD_FORUM_COURSE_ID] = course_id
            created_at = row.get('created_at').get('date')
            updated_at = row.get('updated_at').get('date')
            if not isinstance(created_at, int):
                created_at = datetime.strptime(created_at, pattern_time).timestamp()
            if not isinstance(updated_at, int):
                updated_at = datetime.strptime(updated_at, pattern_time).timestamp()
            post[DBc.FIELD_FORUM_CREATED_AT] = created_at
            post[DBc.FIELD_FORUM_UPDATED_AT] = updated_at
            post[DBc.FIELD_FORUM_BODY] = row.get('body')
            post[DBc.FIELD_FORUM_SENTIMENT] = sentiment_analyzer.analysis(
                post[DBc.FIELD_FORUM_BODY])
            post[DBc.FIELD_FORUM_TYPE] = ForumProcessor.forum_type[row.get('_type')]
            post[DBc.FIELD_FORUM_TITLE] = row.get('title') if row.get('_type') == \
                'CommentThread' else None
            post[DBc.FIELD_FORUM_THREAD_TYPE] = ForumProcessor.thread_type[
                row.get('thread_type')] if row.get('_type') == 'CommentThread' else None
            post[DBc.FIELD_FORUM_COMMENT_THREAD_ID] = row.get('comment_thread_id').get('oid') if \
                row.get('_type') == 'Comment' else None
            post[DBc.FIELD_FORUM_PARENT_ID] = (row.get('parent_id') and row.get(
                'parent_id').get('oid')) if row.get('_type') == 'Comment' else None

            result.append(post)
        return result

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing forum record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data
        cpu_num = get_cpu_num()

        for data in data_to_be_processed:
            data = [data[l: l+PARALLEL_GRAIN] for l in range(0, len(data), PARALLEL_GRAIN)]
            pool = multiprocessing.Pool(processes=cpu_num)
            results = pool.map_async(partial(ForumProcessor.process_few_forums, \
                sentiment_analyzer=self.sentiment_analyzer), data)
            pool.close()
            pool.join()
            for result in results.get():
                if len(result) > 0:
                    for post in result:
                        self.posts[post[DBc.FIELD_FORUM_ORIGINAL_ID]] = post

        for post in self.posts.values():
            if post[DBc.FIELD_FORUM_TYPE] == ForumProcessor.forum_type['CommentThread']:
                continue
            user1_user2 = None
            # if a comment is a reply to another comment, it counts to social between
            # those two comments, else it counts to social between this comment and
            # comment thread.
            if post[DBc.FIELD_FORUM_PARENT_ID]:
                user1_user2 = tuple(sorted([post[DBc.FIELD_FORUM_AUTHOR_ID], \
                    self.posts[post[DBc.FIELD_FORUM_PARENT_ID]][DBc.FIELD_FORUM_AUTHOR_ID]]))
            elif post[DBc.FIELD_FORUM_COMMENT_THREAD_ID]:
                user1_user2 = tuple(sorted([post[DBc.FIELD_FORUM_AUTHOR_ID], \
                    self.posts[post[DBc.FIELD_FORUM_COMMENT_THREAD_ID]][DBc.FIELD_FORUM_AUTHOR_ID]]))
            if user1_user2:
                social_course = self.social.setdefault(post[DBc.FIELD_FORUM_COURSE_ID], {
                    DBc.FIELD_FORUM_SOCIALNETWORKS_COURSE_ID: post[DBc.FIELD_FORUM_COURSE_ID],
                    DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS: {},
                    DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS_RANGE: []})
                social_course[DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS][post[DBc.FIELD_FORUM_AUTHOR_ID]] = \
                    social_course[DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS].setdefault(
                        post[DBc.FIELD_FORUM_AUTHOR_ID], 0) + 1
                social_course.setdefault(DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK, {})
                social_course[DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK].setdefault(user1_user2, {
                    DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_USER_ID_1: user1_user2[0],
                    DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_USER_ID_2: user1_user2[1],
                    DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_WEIGHT: 0
                })[DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_WEIGHT] += 1
        for value in self.social.values():
            value[DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK] = list(value[
                DBc.FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK].values())
            value[DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS_RANGE] = [
                min(value[DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS].values()),
                max(value[DBc.FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS].values())]
        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_FORUM] = self.posts.values()
        processed_data['data'][DBc.COLLECTION_FORUM_SOCIALNETWORKS] = self.social.values()
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        return processed_data
