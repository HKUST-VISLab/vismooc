import hashlib
import multiprocessing
from os.path import getctime, getmtime

from mathematician.config import DBConfig as DBc
from mathematician.pipe import PipeModule
from mathematician.Processor.utils import get_cpu_num

class MetaDBProcessor(PipeModule):
    '''Process metadb files
    '''
    order = -1

    def __init__(self):
        super().__init__()

    @classmethod
    def compute_one_metadb_item(cls, filename):
        '''Process one file to get one metadb document
        '''
        md5 = hashlib.md5()
        try:
            with open(filename, 'r', encoding='utf-8') as file:
                md5.update(file.read().encode('utf-8'))
        except Exception:
            return
        md5 = md5.hexdigest()
        item = {
            DBc.FIELD_METADBFILES_FILEPATH: filename,
            DBc.FIELD_METADBFILES_CREATEDAT: getctime(filename),
            DBc.FIELD_METADBFILES_LAST_MODIFIED: getmtime(filename),
            DBc.FIELD_METADBFILES_PROCESSED: False,
            DBc.FIELD_METADBFILES_ETAG: md5,
            DBc.FIELD_METADBFILES_TYPE: 'eventData' if 'eventData' in filename else 'databaseData',
        }
        return item

    def process(self, raw_data, raw_data_filenames=None):
        cpu_num = get_cpu_num()
        pool = multiprocessing.Pool(processes=cpu_num)
        results = pool.map_async(MetaDBProcessor.compute_one_metadb_item, raw_data_filenames)
        pool.close()
        pool.join()

        metadb_dict = {}
        for result in results.get():
            if isinstance(result, dict):
                metadb_dict[result[DBc.FIELD_METADBFILES_FILEPATH]] = result

        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_METADBFILES] = metadb_dict

        return processed_data
