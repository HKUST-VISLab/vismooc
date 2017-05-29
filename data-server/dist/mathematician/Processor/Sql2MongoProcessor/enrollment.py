import json
from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule

from ..utils import get_data_by_table


class EnrollmentProcessor(PipeModule):

    order = 3
    ENROLL = "enroll"
    UNENROLL = "unenroll"

    def __init__(self):
        super().__init__()
        self.sql_table = 'enrollments'
        self.enrollments = []

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        data = get_data_by_table(self.sql_table)
        return data or None

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing enrollment record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data
        courses = raw_data['data'].get(DBc.COLLECTION_COURSE)
        users = raw_data['data'].get(DBc.COLLECTION_USER)

        for row in data_to_be_processed:
            enrollment = {}
            user_id = row[1]
            course_id = row[2]
            if '+' in course_id:
                course_id = course_id[course_id.index(':')+1:].replace('+', '/')
            course_id = course_id.replace('/', '_')
            enrollment[DBc.FIELD_ENROLLMENT_COURSE_ID] = course_id
            enrollment[DBc.FIELD_ENROLLMENT_USER_ID] = user_id
            enrollment[DBc.FIELD_ENROLLMENT_TIMESTAMP] = row[3].timestamp() if isinstance(row[3], datetime) else None
            enrollment[DBc.FIELD_ENROLLMENT_ACTION] = ProcessEnrollmentTable.ENROLL if \
                row[4] == 1 else ProcessEnrollmentTable.UNENROLL
            self.enrollments.append(enrollment)

            if enrollment[DBc.FIELD_ENROLLMENT_ACTION] == ProcessEnrollmentTable.ENROLL:
                # fill user collection
                if users.get(user_id):
                    users[user_id][DBc.FIELD_USER_COURSE_IDS].add(course_id)
                # fill course collection
                if courses.get(course_id):
                    courses[course_id][DBc.FIELD_COURSE_STUDENT_IDS].add(user_id)
            else:
                if courses.get(course_id) and user_id in courses[course_id][DBc.FIELD_COURSE_STUDENT_IDS]:
                    courses[course_id][DBc.FIELD_COURSE_STUDENT_IDS].discard(user_id)
                if users.get(user_id):
                    users[user_id][DBc.FIELD_USER_DROPPED_COURSE_IDS].add(course_id)
                    if course_id in users[user_id][DBc.FIELD_USER_COURSE_IDS]:
                        users[user_id][DBc.FIELD_USER_COURSE_IDS].discard(course_id)

        processed_data = raw_data

        processed_data['data'][DBc.COLLECTION_ENROLLMENT] = self.enrollments
        processed_data['data'][DBc.COLLECTION_USER] = users
        processed_data['data'][DBc.COLLECTION_COURSE] = courses
        return processed_data
