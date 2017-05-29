'''Util functions for processing data
'''
import hashlib
import io
import multiprocessing
import re
import struct
import urllib
from datetime import timedelta

import pymysql

from mathematician.config import DBConfig as DBc
from mathematician.config import ThirdPartyKeys as TPKc
from mathematician.DB.mongo_dbhelper import MongoDB
from mathematician.http_helper import get as http_get
from mathematician.logger import warn

DB_NAME = 'testVismoocElearning'
DB_HOST = 'localhost'
PARALLEL_GRAIN = 20

YOUTUBE_KEY = TPKc.Youtube_key
RE_ISO_8601 = re.compile(
    r"^(?P<sign>[+-])?"
    r"P(?!\b)"
    r"(?P<years>[0-9]+([,.][0-9]+)?Y)?"
    r"(?P<months>[0-9]+([,.][0-9]+)?M)?"
    r"(?P<weeks>[0-9]+([,.][0-9]+)?W)?"
    r"(?P<days>[0-9]+([,.][0-9]+)?D)?"
    r"((?P<separator>T)(?P<hours>[0-9]+([,.][0-9]+)?H)?"
    r"(?P<minutes>[0-9]+([,.][0-9]+)?M)?"
    r"(?P<seconds>[0-9]+([,.][0-9]+)?S)?)?$"
)

def get_data_by_table(tablename):
    ''' Get all the data from a table
    '''
    if DBc.SQL_CONFIG is None:
        return
    sql_db = pymysql.connect(**DBc.SQL_CONFIG)
    cursor = sql_db.cursor()
    cursor.execute("SELECT * FROM " + tablename)
    results = cursor.fetchall()
    sql_db.close()
    return results

def fetch_video_duration(url):
    '''fetch the video duration from the url
    '''
    header = {"Range": "bytes=0-100"}
    try:
        result = http_get(url, header)
    except urllib.error.URLError as ex:
        warn("Parse video:" + url + "duration failed. It is probably because ssl and certificate problem")
        warn(ex)
        return -1
    if result and (result.get_return_code() < 200 or result.get_return_code() >= 300):
        return -1
    video_duration = -1
    try:
        bio = io.BytesIO(result.get_content())
        data = bio.read(8)
        code, field = struct.unpack('>I4s', data)
        field = field.decode()
        assert field == 'ftyp'
        bio.read(code - 8)
        data = bio.read(8)
        code, field = struct.unpack('>I4s', data)
        field = field.decode()
        assert field == 'moov'
        data = bio.read(8)
        code, field = struct.unpack('>I4s', data)
        field = field.decode()
        assert field == 'mvhd'
        data = bio.read(20)
        infos = struct.unpack('>12x2I', data)
        video_duration = int(infos[1]) // int(infos[0])
    except BaseException as ex:
        warn("Parse video:" + url + "duration failed")
        warn(ex)
    return video_duration


def parse_duration_from_youtube_api(datestring):
    '''Parse video duration from the result return from youtube api
    '''
    if not isinstance(datestring, str):
        raise TypeError("Expecting a string %r" % datestring)
    match = RE_ISO_8601.match(datestring)
    if not match:
        raise BaseException("Unable to parse duration string %r" % datestring)
    groups = match.groupdict()
    for key, val in groups.items():
        if key not in ('separator', 'sign'):
            if val is None:
                groups[key] = "0n"
            groups[key] = float(groups[key][:-1].replace(',', '.'))
    if groups["years"] == 0 and groups["months"] == 0:
        ret = timedelta(days=groups["days"], hours=groups["hours"],
                        minutes=groups["minutes"], seconds=groups["seconds"],
                        weeks=groups["weeks"])
        if groups["sign"] == '-':
            ret = timedelta(0) - ret
    else:
        raise BaseException(
            "there must be something woring in this time string")
    return ret


def get_cpu_num():
    '''Get the cpu number of the machine
    '''
    cpu_num = multiprocessing.cpu_count()
    cpu_num = cpu_num - 1 if cpu_num > 1 else cpu_num
    return cpu_num




def is_processed(filename):
    ''' Check whether a file is processed or not according to
        the metadbfiles collection records
    '''
    db = MongoDB(DB_HOST, DB_NAME)
    metadbfile = db.get_collection(DBc.COLLECTION_METADBFILES)
    md5 = hashlib.md5()
    with open(filename, 'r', encoding='utf-8') as file:
        md5.update(file.read().encode('utf-8'))
    digest = md5.hexdigest()
    db_entry = metadbfile.find_one({
        DBc.FIELD_METADBFILES_ETAG: digest, DBc.FIELD_METADBFILES_PROCESSED: True
    })
    return True if db_entry else False
