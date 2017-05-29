from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule

from ..utils import get_data_by_table

class UserProcessor(PipeModule):
    '''processe the user table
    '''

    order = 2

    def __init__(self):
        super().__init__()
        self.sql_table = 'users'
        self.users = {}

    def load_data(self, data_filenames):
        '''Load target file
        '''
        data = get_data_by_table(self.sql_table)
        return data or None

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing user record")
        this_year = datetime.now().year
        data_to_be_processed = self.load_data(raw_data_filenames)

        if data_to_be_processed is None:
            return raw_data

        for row in data_to_be_processed:
            user = {}
            user_id = row[1]
            user[DBc.FIELD_USER_USER_NAME] = row[2]
            user[DBc.FIELD_USER_NAME] = row[3]
            user[DBc.FIELD_USER_LOCATION] = row[5]
            user[DBc.FIELD_USER_BIRTH_DATE] = row[6] or this_year
            user[DBc.FIELD_USER_EDUCATION_LEVEL] = row[7]
            user[DBc.FIELD_USER_BIO] = row[8]
            user[DBc.FIELD_USER_GENDER] = row[9]
            user[DBc.FIELD_USER_COUNTRY] = row[10]
            user[DBc.FIELD_USER_COURSE_IDS] = set()
            user[DBc.FIELD_USER_DROPPED_COURSE_IDS] = set()
            user[DBc.FIELD_USER_ORIGINAL_ID] = user_id
            user[DBc.FIELD_USER_COURSE_ROLE] = {}
            self.users[user_id] = user

        processed_data = raw_data
        # user collection needs courseIds and droppedCourseIds
        processed_data['data'][DBc.COLLECTION_USER] = self.users

        return processed_data
