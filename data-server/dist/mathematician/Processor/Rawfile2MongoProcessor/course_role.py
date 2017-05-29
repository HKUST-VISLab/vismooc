from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule


class CourseRoleProcessor(PipeModule):

    order = 2

    def __init__(self):
        super().__init__()
        self.processed_files = []

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        for filename in data_filenames:
            if '-student_courseaccessrole-' in filename:
                with open(filename, 'r', encoding='utf-8') as file:
                    next(file)
                    raw_data = file.readlines()
                    self.processed_files.append(filename)
                    yield raw_data

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing courseaccessrole record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data
        courses = raw_data['data'].get(DBc.COLLECTION_COURSE)
        users = raw_data['data'].get(DBc.COLLECTION_USER)

        for data in data_to_be_processed:
            for row in data:
                row = row[:-1].split('\t')
                course_id = row[1]
                if '+' in course_id:
                    course_id = course_id[course_id.index(':')+1:].replace('+', '/')
                course_id = course_id.replace('/', '_')
                user_id = row[2]
                role = row[3]

                if role == 'instructor':
                    courses[course_id][DBc.FIELD_COURSE_INSTRUCTOR].append(user_id)
                users[user_id][DBc.FIELD_USER_COURSE_ROLE][course_id] = role

        processed_data = raw_data

        processed_data['data'][DBc.COLLECTION_USER] = users
        processed_data['data'][DBc.COLLECTION_COURSE] = courses
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        return processed_data
