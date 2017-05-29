from datetime import datetime
from operator import itemgetter
from mathematician.pipe import PipeModule
from mathematician.config import DBConfig as DBc
from mathematician.logger import info

class EnrollmentProcessor(PipeModule):

    order = 3
    ENROLL = "enroll"
    UNENROLL = "unenroll"
    action = {'1': ENROLL, '0': UNENROLL}

    def __init__(self):
        super().__init__()
        self.processed_files = []
        self.enrollments = []

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        for filename in data_filenames:
            if '-student_courseenrollment-' in filename:
                with open(filename, 'r', encoding='utf-8') as file:
                    next(file)
                    raw_data = file.readlines()
                    self.processed_files.append(filename)
                    yield raw_data

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing enrollment record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data
        courses = raw_data['data'].get(DBc.COLLECTION_COURSE)
        users = raw_data['data'].get(DBc.COLLECTION_USER)

        for data in data_to_be_processed:
            pattern_time = "%Y-%m-%d %H:%M:%S"
            for row in sorted(data, key=itemgetter(3)):
                row = row[:-1].split('\t')
                enrollment = {}
                user_id = row[1]
                course_id = row[2]
                if '+' in course_id:
                    course_id = course_id[course_id.index(':')+1:].replace('+', '/')
                course_id = course_id.replace('/', '_')
                enrollment[DBc.FIELD_ENROLLMENT_COURSE_ID] = course_id
                enrollment[DBc.FIELD_ENROLLMENT_USER_ID] = user_id
                enrollment[DBc.FIELD_ENROLLMENT_TIMESTAMP] = datetime.strptime(row[3], pattern_time).timestamp()
                enrollment[DBc.FIELD_ENROLLMENT_ACTION] = EnrollmentProcessor.action.get(row[4])
                self.enrollments.append(enrollment)

                if enrollment[DBc.FIELD_ENROLLMENT_ACTION] == EnrollmentProcessor.ENROLL:
                    # fill user collection
                    users[user_id][DBc.FIELD_USER_COURSE_IDS].add(course_id)
                    # fill course collection
                    courses[course_id][DBc.FIELD_COURSE_STUDENT_IDS].add(row[1])
                else:
                    courses[course_id][DBc.FIELD_COURSE_STUDENT_IDS].discard(row[1])
                    users[row[1]][DBc.FIELD_USER_COURSE_IDS].discard(course_id)
                    users[row[1]][DBc.FIELD_USER_DROPPED_COURSE_IDS].add(course_id)

        processed_data = raw_data

        processed_data['data'][DBc.COLLECTION_ENROLLMENT] = self.enrollments
        processed_data['data'][DBc.COLLECTION_USER] = users
        processed_data['data'][DBc.COLLECTION_COURSE] = courses
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        return processed_data
