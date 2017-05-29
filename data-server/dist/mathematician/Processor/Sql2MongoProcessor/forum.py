from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule
from mathematician.text_helper import SentimentAnalyzer

from ..utils import get_data_by_table

class ForumProcessor(PipeModule):

    order = 4
    forum_type = {'CommentThread': 'CommentThread', 'Comment': 'Comment'}
    thread_type = {'question': 'Question', 'discussion': 'Discussion'}

    def __init__(self):
        super().__init__()
        self.sql_table = 'forum'
        self.forums = []
        self.posts = {}
        self.social = {}
        self.sentiment_analyzer = SentimentAnalyzer()

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        data = get_data_by_table(self.sql_table)
        return data or None

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing forum record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data

        for row in data_to_be_processed:
            post = {}
            post[DBc.FIELD_FORUM_ORIGINAL_ID] = row[1]
            post[DBc.FIELD_FORUM_AUTHOR_ID] = row[3]
            course_id = row[2]
            if '+' in course_id:
                course_id = course_id[course_id.index(':')+1:].replace('+', '/')
            course_id = course_id.replace('/', '_')
            post[DBc.FIELD_FORUM_COURSE_ID] = course_id

            post[DBc.FIELD_FORUM_CREATED_AT] = row[4].timestamp() if isinstance(row[4], datetime) else None
            post[DBc.FIELD_FORUM_UPDATED_AT] = row[5].timestamp() if isinstance(row[5], datetime) else None
            post[DBc.FIELD_FORUM_BODY] = row[6]
            post[DBc.FIELD_FORUM_SENTIMENT] = self.sentiment_analyzer.analysis(
                post[DBc.FIELD_FORUM_BODY])
            post[DBc.FIELD_FORUM_TYPE] = ProcessForumTable.forum_type[row[7]]
            post[DBc.FIELD_FORUM_TITLE] = row[8]
            post[DBc.FIELD_FORUM_THREAD_TYPE] = row[9]
            post[DBc.FIELD_FORUM_COMMENT_THREAD_ID] = row[10]
            post[DBc.FIELD_FORUM_PARENT_ID] = row[11]
            self.posts[row[1]] = post

        for post in self.posts.values():

            if post[DBc.FIELD_FORUM_TYPE] == ProcessForumTable.forum_type['CommentThread']:
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

        return processed_data
