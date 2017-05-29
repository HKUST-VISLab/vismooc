from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule


class UserProcessor(PipeModule):
    '''processe the user files
    '''

    order = 1

    def __init__(self):
        super().__init__()
        self._userprofile = {}
        self.processed_files = []
        self.users = {}

    def load_data(self, data_filenames):
        '''Load target file
        '''
        processed_files = []
        auth_user_filenames = []
        auth_userprofile_filenames = []
        for filename in data_filenames:
            if '-auth_user-' in filename:
                auth_user_filenames.append(filename)
            elif '-auth_userprofile-' in filename:
                auth_userprofile_filenames.append(filename)

        if len(auth_userprofile_filenames) > 0:
            for auth_userprofile_filename in auth_userprofile_filenames:
                self.processed_files.append(auth_userprofile_filename)
                with open(auth_userprofile_filename, 'r', encoding='utf-8') as file:
                    next(file)
                    lines = file.readlines()
                    for i in reversed(range(len(lines))):
                        line = lines[i]
                        if line.startswith('\\n'):
                            lines[i - 1] = lines[i - 1][:-1] + line
                        else:
                            line = line[:-1].split('\t')
                            self._userprofile[line[1]] = line

        if len(auth_user_filenames) > 0:
            for auth_user_filename in auth_user_filenames:
                processed_files.append(auth_user_filename)
                with open(auth_user_filename, 'r', encoding='utf-8') as file:
                    next(file)
                    raw_data = file.readlines()
                    self.processed_files.append(auth_user_filename)
                    yield raw_data

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing user record")
        this_year = datetime.now().year
        data_to_be_processed = self.load_data(raw_data_filenames)

        if data_to_be_processed is None:
            return raw_data

        for data in data_to_be_processed:
            for row in data:
                row = row[:-1].split('\t')
                user = {}
                user_id = row[0]
                user_profile = self._userprofile.get(user_id)
                user[DBc.FIELD_USER_GENDER] = user_profile and user_profile[7]
                user[DBc.FIELD_USER_COURSE_IDS] = set()
                user[DBc.FIELD_USER_DROPPED_COURSE_IDS] = set()

                str_user_birth_year = (row[16] != "NULL" and row[16]) or \
                    (user_profile and user_profile[9])

                user_birth_year = (str_user_birth_year.isdigit() and int(str_user_birth_year)) or this_year
                # currently we only have the birth year in format YYYY
                user[DBc.FIELD_USER_BIRTH_DATE] = str(user_birth_year)
                user[DBc.FIELD_USER_COUNTRY] = row[14] or (user_profile and (user_profile[13] or user_profile[4]))
                user[DBc.FIELD_USER_USER_NAME] = row[1]
                user[DBc.FIELD_USER_EDUCATION_LEVEL] = user_profile and user_profile[10]
                user[DBc.FIELD_USER_LOCATION] = user_profile and user_profile[4]
                user[DBc.FIELD_USER_NAME] = (row[2] + row[3]) or (user_profile and user_profile[2])
                user[DBc.FIELD_USER_ORIGINAL_ID] = user_id
                user[DBc.FIELD_USER_COURSE_ROLE] = {}
                user[DBc.FIELD_USER_BIO] = None
                self.users[user[DBc.FIELD_USER_ORIGINAL_ID]] = user

        processed_data = raw_data
        # user collection needs courseIds and droppedCourseIds
        processed_data['data'][DBc.COLLECTION_USER] = self.users
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        return processed_data
