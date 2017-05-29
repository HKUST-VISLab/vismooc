'''This module define some abstract class for database manipulation
'''
from abc import ABCMeta, abstractmethod

class BaseDB(metaclass=ABCMeta):
    '''Construct a database instance with some manipulate method
    '''

    def __init__(self, host, db_name, port):
        '''The constructor of database abstract class
        '''

    @abstractmethod
    def get_collection_names(self):
        """Get a list of all the collection names in this database.
        Returns:
            list: A list of collection name
        """

    @abstractmethod
    def get_collection(self, name):
        """Get a Collection with the given name

        Args:
            name (string): The name of the collection
        Returns:
            BaseCollection: The target collection
        """

    @abstractmethod
    def add_user(self, user_name, passwd):
        """Set username and password to DB for authentication

        Args:
            user_name (string): The name of the user
            passwd (string): The password of the user
        """

    @abstractmethod
    def clear(self):
        """clear all the data in the this db

        """

class BaseCollection(metaclass=ABCMeta):
    '''Construct a db collection with some manipulate method
    '''

    def __init__(self, db, name):
        '''The constructor of abstract class of db collection
        '''

    @abstractmethod
    def insert_one(self, document):
        """Insert a single document
        """

    @abstractmethod
    def insert_many(self, documents):
        """Insert an iterable of documents
        """

    @abstractmethod
    def delete_one(self, document_id):
        """Delete a single document according to its id
        """

    @abstractmethod
    def delete_many(self, query):
        """Delete all documents find by the query
        """

    @abstractmethod
    def delete_one_then_return(self, document_id, projection=None):
        """Deletes a single document then return the document.
        """

    @abstractmethod
    def update_one(self, document_id, update_data, upsert=False):
        """Update a single document according to its id
        """

    @abstractmethod
    def update_one_then_return(self, document_id, update_data, upsert=False, projection=None):
        """Update a single document then return the updated document
        """

    @abstractmethod
    def update_many(self, query, update_data, upsert=False):
        """Update all documents find by the query
        """

    @abstractmethod
    def find(self, query, projection, limit=None, skip=None, sort=None):
        """Find documents according to the query
        """

    @abstractmethod
    def find_one(self, query):
        """Find one document aoccording to the query
        """

    @abstractmethod
    def count(self, query, limit=None, skip=None):
        """Get the number of documents in this collection.
        """

    @abstractmethod
    def distinct(self, key, query):
        """Get a list of distinct values for key among all documents in this collection.
        """

    @abstractmethod
    def create_index(self, keys, **kwargs):
        """Creates an index on this collection.
        """

    @abstractmethod
    def drop_index(self, index_name):
        """Drops the specified index on this collection.
        """

    @abstractmethod
    def reindex(self):
        """Rebuilds all indexes on this collection.
        """

    @abstractmethod
    def get_index_names(self):
        """Get the list of index name
        """

    @abstractmethod
    def get_index(self, name):
        """Get a index according to its name
        """

    def drop(self):
        """Drop this collection
        """

    def rename(self, new_name):
        """Rename this collection
        """

    def group(self, key, query, **kwargs):
        """Perform a query similar to an SQL group by operation.
        """

    def map_reduce(self, map_func, reduce_func, out, **kwargs):
        """Perform a map/reduce operation on this collection.
        """

    def inline_map_reduce(self, map_func, reduce_func, **kwargs):
        """Perform an inline map/reduce operation on this collection.
        """

    def parallel_scan(self, num_cursors):
        """Scan this entire collection in parallel.
        """

    def initialize_unordered_bulk_op(self, bypass_document_validation=False):
        """Initialize an unordered batch of write operations.
        """

    def initialize_ordered_bulk_op(self, bypass_document_validation=False):
        """Initialize an ordered batch of write operations.
        """
