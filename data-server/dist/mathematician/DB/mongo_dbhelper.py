'''A mongodb helper
'''
import pymongo
from pymongo import MongoClient
from .base_dbhelper import BaseDB, BaseCollection

class MongoDB(BaseDB):
    '''A class to manipulate database
    '''
    def __init__(self, host, db_name, port=27017):
        if not isinstance(host, str):
            raise TypeError("MongoDB: host should be instance of str")
        if not isinstance(db_name, str):
            raise TypeError("MongoDB: db_name should be instance of str")
        super().__init__(host, db_name, port)
        self.__client = MongoClient(host, port)
        self.__db = self.__client[db_name]

    def get_db(self):
        '''Get the database instance
        '''
        return self.__db

    def create_collection(self, name, codec_options=None,
                          read_preference=None, write_concern=None,
                          read_concern=None, **kwargs):
        '''Create a collection
        '''
        if not isinstance(name, str):
            raise TypeError("create_collection: name should be instance of str")
        self.__db.create_collection(name, codec_options, read_preference,
                                    write_concern, read_concern, **kwargs)
        return MongoCollection(self.__db, name)

    def get_collection_names(self):
        return self.__db.collection_names()

    def get_collection(self, name):
        if not isinstance(name, str):
            raise TypeError("get_collection: name should be instance of str")
        return MongoCollection(self.__db, name)

    def add_user(self, username, passwd):
        if not isinstance(username, str):
            raise TypeError("add_user: username should be instance of str")
        if not passwd:
            raise TypeError("add_user: you must set a passwd")
        return self.__db.add_user(username, passwd)

    def users_info(self):
        '''Get all users of this db
        '''
        return self.__db.command('usersInfo').get('users')

    def clear(self):
        self.__client.drop_database(self.__db)

class MongoCollection(BaseCollection):
    '''A class to manipulate collection
    '''
    def __init__(self, db, name):
        if not isinstance(db, pymongo.database.Database):
            raise TypeError("MongoDB: db should be instance of pymongo.database.Database")
        if not isinstance(name, str):
            raise TypeError("MongoDB: name should be instance of str")
        super().__init__(db, name)
        self.__db = db
        self.__collection = self.__db[name]
        self._index_names = None

    def insert_one(self, document):
        self.__collection.insert_one(document)

    def insert_many(self, documents):
        """Insert an iterable of documents
        """
        self.__collection.insert_many(documents)

    def delete_one(self, document_id):
        """Delete a single document according to its id
        """
        self.__collection.delete_one({"_id": document_id})

    def delete_many(self, query):
        """Delete all documents find by the query
        """
        self.__collection.delete_many(query)

    def delete_one_then_return(self, document_id, projection=None):
        """Deletes a single document then return the document.
        """
        return self.__collection.find_one_and_delete({"_id": document_id}, projection)

    def update_one(self, query, update_data, upsert=False):
        """Update a single document according to its id
        """
        self.__collection.update_one(query, update_data, upsert)

    def update_one_then_return(self, document_id, update_data, upsert=False, projection=None):
        """Update a single document then return the updated document
        """
        return self.__collection.find_one_and_update(
            {"_id": document_id}, update_data, projection,
            upsert=upsert, return_document=pymongo.collection.ReturnDocument.AFTER)

    def update_many(self, query, update_data, upsert=False):
        """Update all documents find by the query
        """
        self.__collection.update_many(query, update_data, upsert)

    def find(self, query, projection=None, limit=0, skip=0, sort=None):
        """Find documents according to the query
        """
        return self.__collection.find(query, projection=projection, skip=skip, limit=limit,
                                      sort=sort)

    def find_one(self, query):
        """Find one document aoccording to the query
        """
        return self.__collection.find_one(query)

    def count(self, query, limit=0, skip=0):
        """Get the number of documents in this collection.
        """
        return self.__collection.count(query, limit=limit, skip=skip)

    def distinct(self, key, query):
        """Get a list of distinct values for key among all documents in this collection.
        """
        return self.__collection.distinct(key, query)

    def create_index(self, keys, **kwargs):
        """Creates an index on this collection.
        """
        return self.__collection.create_index(keys, **kwargs)

    def drop_index(self, index_name):
        """Drops the specified index on this collection.
        """
        self.__collection.drop_index(index_name)

    def reindex(self):
        """Rebuilds all indexes on this collection.
        """
        self.__collection.reindex()

    def get_index_names(self):
        """Get the list of index name
        """
        return list(self.__collection.index_information().keys())

    def get_index(self, name):
        """Get a index according to its name
        """
        return self.__collection.index_information()[name]
