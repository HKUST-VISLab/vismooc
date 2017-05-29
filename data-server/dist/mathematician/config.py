"""All the config fields of data server
"""
import json
from os.path import exists, join

from . import logger


class ThirdPartyKeys:
    """Third party keys
    """
    Youtube_key = None

class DBConfig:
    """Config of database
    """
    DB_HOST = "mongo_host"
    DB_PORT = 'mongo_port'
    DB_NAME = "DB_name"
    DB_USER = "db_user"
    DB_PASSWORD = "db_password"
    DB_GENERAL_COLLECTIONS = "db_collections"
    SQL_CONFIG = None
    COLLECTION_GENERAL_NAME = "collection_name"
    COLLECTION_GENERAL_FIELDS = "fields"
    COLLECTION_GENERAL_INDEX = "index"
    FIELD_GENERAL_NAME = "field_name"
    FIELD_GENERAL_VALIDATION = "validation"
    INDEX_GENERAL_INDEX_ORDER = "order"

    COLLECTION_COURSE = "courses"
    FIELD_COURSE_ORIGINAL_ID = "originalId"
    FIELD_COURSE_NAME = "name"
    FIELD_COURSE_YEAR = "year"
    FIELD_COURSE_ORG = "org"
    FIELD_COURSE_INSTRUCTOR = "instructor"
    FIELD_COURSE_STATUS = "status"
    FIELD_COURSE_URL = "url"
    FIELD_COURSE_IMAGE_URL = "courseImageUrl"
    FIELD_COURSE_DESCRIPTION = "description"
    FIELD_COURSE_METAINFO = "metaInfo"
    FIELD_COURSE_STARTTIME = "startDate"
    FIELD_COURSE_ENDTIME = "endDate"
    FIELD_COURSE_ENROLLMENT_START = "enrollmentStart"
    FIELD_COURSE_ENROLLMENT_END = "enrollmentEnd"
    FIELD_COURSE_STUDENT_IDS = "studentIds"
    FIELD_COURSE_VIDEO_IDS = "videoIds"
    FIELD_COURSE_GRADES = "grades"

    COLLECTION_USER = "users"
    FIELD_USER_ORIGINAL_ID = "originalId"
    FIELD_USER_USER_NAME = "username"
    FIELD_USER_NAME = "name"
    FIELD_USER_LANGUAGE = "language"
    FIELD_USER_LOCATION = "location"
    FIELD_USER_BIRTH_DATE = "birthDate"
    FIELD_USER_EDUCATION_LEVEL = "educationLevel"
    FIELD_USER_BIO = "bio"
    FIELD_USER_GENDER = "gender"
    FIELD_USER_COUNTRY = "country"
    FIELD_USER_COURSE_IDS = "courseIds"
    FIELD_USER_DROPPED_COURSE_IDS = "droppedCourseIds"
    FIELD_USER_COURSE_ROLE = "courseRoles"

    COLLECTION_ENROLLMENT = "enrollments"
    FIELD_ENROLLMENT_COURSE_ID = "courseId"
    FIELD_ENROLLMENT_USER_ID = "userId"
    FIELD_ENROLLMENT_TIMESTAMP = "timestamp"
    FIELD_ENROLLMENT_ACTION = "action"

    COLLECTION_GRADES = "grades"
    FIELD_GRADES_USER_ID = "userId"
    FIELD_GRADES_COURSE_ID = "courseId"
    FIELD_GRADES_TIMESTAMP = "timestamp"
    FIELD_GRADES_COURSE_MODULE = "courseModule"
    FIELD_GRADES_GRADE = "grade"

    COLLECTION_VIDEO = "videos"
    FIELD_VIDEO_ORIGINAL_ID = "originalId"
    FIELD_VIDEO_NAME = "name"
    FIELD_VIDEO_TEMPORAL_HOTNESS = "temporalHotness"
    FIELD_VIDEO_METAINFO = "metaInfo"
    FIELD_VIDEO_SECTION = "section"
    FIELD_VIDEO_DESCRIPTION = "description"
    FIELD_VIDEO_RELEASE_DATE = "releaseDate"
    FIELD_VIDEO_URL = "url"
    FIELD_VIDEO_DURATION = "duration"

    COLLECTION_FORUM_SOCIALNETWORKS = "forumsocialnetworks"
    FIELD_FORUM_SOCIALNETWORKS_COURSE_ID = "courseId"
    FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK = "socialNetwork"
    FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_USER_ID_1 = "userId1"
    FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_USER_ID_2 = "userId2"
    FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK_WEIGHT = "weight"
    FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS = "activeness"
    FIELD_FORUM_SOCIALNETWORKS_ACTIVENESS_RANGE = "activenessRange"

    COLLECTION_FORUM = "forumthreads"
    FIELD_FORUM_ORIGINAL_ID = "originalId"
    FIELD_FORUM_AUTHOR_ID = "authorId"
    FIELD_FORUM_COURSE_ID = "courseId"
    FIELD_FORUM_CREATED_AT = "createdAt"
    FIELD_FORUM_UPDATED_AT = "updatedAt"
    FIELD_FORUM_BODY = "body"
    FIELD_FORUM_SENTIMENT = "sentiment"
    FIELD_FORUM_TYPE = "type"
    FIELD_FORUM_TITLE = "title"
    FIELD_FORUM_THREAD_TYPE = "threadType"
    FIELD_FORUM_COMMENT_THREAD_ID = "commentThreadId"
    FIELD_FORUM_PARENT_ID = "parentId"

    COLLECTION_LOG = "logs"
    FIELD_LOG_USER_ID = "userId"
    FIELD_LOG_VIDEO_ID = "videoId"
    FIELD_LOG_COURSE_ID = "courseId"
    FIELD_LOG_TIMESTAMP = "timestamp"
    FIELD_LOG_TYPE = "type"
    FIELD_LOG_METAINFO = "metaInfo"

    COLLECTION_DENSELOGS = "denselogs"
    FIELD_DENSELOGS_VIDEO_ID = "videoId"
    FIELD_DENSELOGS_COURSE_ID = "courseId"
    FIELD_DENSELOGS_TIMESTAMP = "timestamp"
    FIELD_DENSELOGS_CLICKS = "clicks"
    FIELD_DENSELOGS_TYPE = "type"
    FIELD_DENSELOGS_USER_ID = "userId"
    FIELD_DENSELOGS_PATH = "path"
    FIELD_DENSELOGS_CURRENT_TIME = "currentTime"
    FIELD_DENSELOGS_NEW_TIME = "newTime"
    FIELD_DENSELOGS_OLD_TIME = "oldTime"
    FIELD_DENSELOGS_NEW_SPEED = "newSpeed"
    FIELD_DENSELOGS_OLD_SPEED = "oldSpeed"

    COLLECTION_VIDEO_RAWLOGS = "rawlogs"

    COLLECTION_METADBFILES = "metadbfiles"
    FIELD_METADBFILES_ETAG = "etag"
    FIELD_METADBFILES_CREATEDAT = "createdAt"
    FIELD_METADBFILES_LAST_MODIFIED = "lastModified"
    FIELD_METADBFILES_TYPE = "type"
    FIELD_METADBFILES_FILEPATH = "path"
    FIELD_METADBFILES_PROCESSED = "processed"

    TYPE_MYSQL = "mysql"
    TYPE_MONGO = "mongo"
    TYPE_CLICKSTREAM = "clickstream"

    CONFIG_JSON = {
        DB_HOST: "localhost",
        DB_PORT: 27017,
        DB_NAME: "testVismoocElearning",
        DB_USER: "",
        DB_PASSWORD: "",
        DB_GENERAL_COLLECTIONS:
        [
            {
                COLLECTION_GENERAL_NAME: COLLECTION_COURSE,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_NAME,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_YEAR,
                        FIELD_GENERAL_VALIDATION: {"$regex": "/^[1-9][1-9]{3}_Q[0-9]_R[0-9]/"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_ORG,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_STATUS,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_URL,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_IMAGE_URL,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_DESCRIPTION,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_METAINFO,
                        FIELD_GENERAL_VALIDATION: {"$type": "object"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_ENDTIME,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_STARTTIME,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_ENROLLMENT_START,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_ENROLLMENT_END,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_ORIGINAL_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_STUDENT_IDS,
                        FIELD_GENERAL_VALIDATION: {"$type": "array"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_VIDEO_IDS,
                        FIELD_GENERAL_VALIDATION: {"$type": "array"}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    # {
                    #     FIELD_GENERAL_NAME: FIELD_COURSE_NAME,
                    #     INDEX_GENERAL_INDEX_ORDER: 1
                    # },
                    {
                        FIELD_GENERAL_NAME: FIELD_COURSE_ORIGINAL_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    # {
                    #     FIELD_GENERAL_NAME: FIELD_COURSE_STATUS,
                    #     INDEX_GENERAL_INDEX_ORDER: 1
                    # }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_USER,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_NAME,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_USER_NAME,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_LANGUAGE,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_LOCATION,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    # {
                    #     FIELD_GENERAL_NAME: FIELD_USER_BIRTH_DATE,
                    #     FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    # },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_EDUCATION_LEVEL,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_BIO,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    # {
                    #     FIELD_GENERAL_NAME: FIELD_USER_GENDER,
                    #     FIELD_GENERAL_VALIDATION: {"$in": ["male", "female"]}
                    # },
                    # {
                    #     FIELD_GENERAL_NAME: FIELD_USER_ORIGINAL_ID,
                    #     FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    # },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_COUNTRY,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_COURSE_IDS,
                        FIELD_GENERAL_VALIDATION: {"$type": "array"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_DROPPED_COURSE_IDS,
                        FIELD_GENERAL_VALIDATION: {"$type": "array"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_COURSE_ROLE,
                        FIELD_GENERAL_VALIDATION: {"$type": "object"}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_USER_ORIGINAL_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_ENROLLMENT,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_ENROLLMENT_COURSE_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "objectId"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_ENROLLMENT_USER_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "objectId"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_ENROLLMENT_TIMESTAMP,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_ENROLLMENT_ACTION,
                        FIELD_GENERAL_VALIDATION: {"$in": ["TODO", "TODO"]}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_ENROLLMENT_TIMESTAMP,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_VIDEO,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_NAME,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_TEMPORAL_HOTNESS,
                        FIELD_GENERAL_VALIDATION: {"$type": "object"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_METAINFO,
                        FIELD_GENERAL_VALIDATION: {"$type": "object"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_SECTION,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_DESCRIPTION,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_RELEASE_DATE,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_URL,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_DURATION,
                        FIELD_GENERAL_VALIDATION: {"$type": "int"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_ORIGINAL_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "string"}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_VIDEO_ORIGINAL_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_LOG,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_USER_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "objectId"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_VIDEO_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "objectId"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_COURSE_ID,
                        FIELD_GENERAL_VALIDATION: {"$type": "objectId"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_TIMESTAMP,
                        FIELD_GENERAL_VALIDATION: {"$type": "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_TYPE,
                        FIELD_GENERAL_VALIDATION: {"$in": ["TODO", "TODO"]}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_METAINFO,
                        FIELD_GENERAL_VALIDATION: {"$type": "object"}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_VIDEO_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_USER_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_COURSE_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_LOG_TIMESTAMP,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_DENSELOGS,
                COLLECTION_GENERAL_FIELDS:
                [
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_DENSELOGS_TIMESTAMP,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_DENSELOGS_VIDEO_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_DENSELOGS_COURSE_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_METADBFILES,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_TYPE,
                        FIELD_GENERAL_VALIDATION: {"$type", "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_LAST_MODIFIED,
                        FIELD_GENERAL_VALIDATION: {"$type", "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_FILEPATH,
                        FIELD_GENERAL_VALIDATION: {"$type", "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_ETAG,
                        FIELD_GENERAL_VALIDATION: {"$type", "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_CREATEDAT,
                        FIELD_GENERAL_VALIDATION: {"$type", "timestamp"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_PROCESSED,
                        FIELD_GENERAL_VALIDATION: {"$type", "boolean"}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_TYPE,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_ETAG,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_METADBFILES_LAST_MODIFIED,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    }
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_FORUM_SOCIALNETWORKS,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_FORUM_SOCIALNETWORKS_COURSE_ID,
                        FIELD_GENERAL_VALIDATION: {"$type", "string"}
                    },
                    {
                        FIELD_GENERAL_NAME: FIELD_FORUM_SOCIALNETWORKS_SOCIALNETWORK,
                        FIELD_GENERAL_VALIDATION: {"$type", "object"}
                    },
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_FORUM_SOCIALNETWORKS_COURSE_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                ]
            },
            {
                COLLECTION_GENERAL_NAME: COLLECTION_FORUM,
                COLLECTION_GENERAL_FIELDS:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_FORUM_ORIGINAL_ID,
                        FIELD_GENERAL_VALIDATION: {"$type", "string"}
                    }
                ],
                COLLECTION_GENERAL_INDEX:
                [
                    {
                        FIELD_GENERAL_NAME: FIELD_FORUM_ORIGINAL_ID,
                        INDEX_GENERAL_INDEX_ORDER: 1
                    },
                ]
            }
        ]
    }


def init_config(config_file_path):
    """ Init all the configuration from a config file
    """
    if not exists(config_file_path):
        logger.warn("The config file does not exist")
        return
    with open(config_file_path, "r") as file:
        try:
            config_json = json.load(file)
        except json.JSONDecodeError as ex:
            logger.warn("Decode init json file failed")
            logger.warn(ex.msg)
            return

    mongo_config = config_json.get("mongo")
    # init mongo db
    if mongo_config:
        DBConfig.DB_HOST = mongo_config.get("host") or DBConfig.DB_HOST
        DBConfig.DB_NAME = mongo_config.get("name") or DBConfig.DB_NAME
        DBConfig.DB_PORT = mongo_config.get("port") or DBConfig.DB_PORT

    sql_config = config_json.get('sql')
    if sql_config:
        DBConfig.SQL_CONFIG = sql_config

    dataserver_config = config_json.get('data_server')

    # init 3rd party keys
    third_party_keys = dataserver_config.get("third_party_keys")
    if third_party_keys:
        ThirdPartyKeys.Youtube_key = third_party_keys.get('Youtube_key') or ThirdPartyKeys.Youtube_key
