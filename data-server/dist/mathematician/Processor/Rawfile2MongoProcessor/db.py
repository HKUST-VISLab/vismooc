from mathematician.pipe import PipeModule
from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.DB.mongo_dbhelper import MongoDB

class DBProcessor(PipeModule):
    order = 999

    def __init__(self):
        super().__init__()
        db_config = DBc.CONFIG_JSON
        self.db = MongoDB(db_config[DBc.DB_HOST], db_config[DBc.DB_NAME], port=db_config[DBc.DB_PORT])
        self.db.clear()
        for collection_config in db_config[DBc.DB_GENERAL_COLLECTIONS]:
            collection = self.db.create_collection(collection_config[DBc.COLLECTION_GENERAL_NAME])
            indexes = []
            for index_config in collection_config[DBc.COLLECTION_GENERAL_INDEX]:
                indexes.append((index_config[DBc.FIELD_GENERAL_NAME], index_config[DBc.INDEX_GENERAL_INDEX_ORDER]))
            collection.create_index(indexes)

    def process(self, raw_data, raw_data_filenames=None):
        info("DB Insertion")
        db_data = raw_data['data']

        if db_data.get(DBc.COLLECTION_METADBFILES):
            for processed_files in raw_data['processed_files']:
                db_data[DBc.COLLECTION_METADBFILES][processed_files][DBc.FIELD_METADBFILES_PROCESSED] = True
            db_data[DBc.COLLECTION_METADBFILES] = db_data[DBc.COLLECTION_METADBFILES].values()

        if db_data.get(DBc.COLLECTION_COURSE):
            db_data[DBc.COLLECTION_COURSE] = db_data[DBc.COLLECTION_COURSE].values()
            for course in db_data[DBc.COLLECTION_COURSE]:
                course[DBc.FIELD_COURSE_VIDEO_IDS] = list(course[DBc.FIELD_COURSE_VIDEO_IDS])
                course[DBc.FIELD_COURSE_STUDENT_IDS] = list(course[DBc.FIELD_COURSE_STUDENT_IDS])

        if db_data.get(DBc.COLLECTION_USER):
            db_data[DBc.COLLECTION_USER] = db_data[DBc.COLLECTION_USER].values()
            for user in db_data[DBc.COLLECTION_USER]:
                user[DBc.FIELD_USER_COURSE_IDS] = list(user[DBc.FIELD_USER_COURSE_IDS])
                user[DBc.FIELD_USER_DROPPED_COURSE_IDS] = list(
                    user[DBc.FIELD_USER_DROPPED_COURSE_IDS])

        if db_data.get(DBc.COLLECTION_VIDEO):
            db_data[DBc.COLLECTION_VIDEO] = db_data[DBc.COLLECTION_VIDEO].values()

        # insert to db
        for collection_name in db_data:
            info('Insert ' + collection_name)
            collection = self.db.get_collection(collection_name)
            if db_data[collection_name] is not None:
                collection.insert_many(db_data[collection_name])

        return raw_data
