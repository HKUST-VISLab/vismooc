import json
import re
import hashlib
import multiprocessing
from os import listdir
from os.path import isfile, join, isdir, getctime, getmtime
from datetime import datetime

from mathematician import http_helper as http
from mathematician.pipe import PipeLine
from mathematician.Processor.OldHKVMoocProcessor import *
from mathematician.DB.mongo_dbhelper import MongoDB
from mathematician.config import DBConfig as DBc
from mathematician.logger import info


DB_NAME = 'testVismoocElearning'
DB_HOST = 'localhost'

def get_files(dir_name):
    files = []
    if '.ignore' in dir_name:
        return []
    for f in listdir(dir_name):
        if isfile(join(dir_name, f)):
            files.append(join(dir_name, f))
        elif isdir(join(dir_name, f)):
            files.extend(get_files(join(dir_name, f)))
    return files


if __name__ == "__main__":
    coursesDir = '/vismooc-test-data/elearning-data/'
    filenames = get_files(coursesDir)

    pipeLine = PipeLine()
    pipeLine.input_files(filenames).pipe(MetaDBProcessor()).pipe(CourseProcessor()).pipe(
        EnrollmentProcessor()).pipe(LogProcessor()).pipe(UserProcessor()).pipe(
            ForumProcessor()).pipe(GradeProcessor()).pipe(DBProcessor())
    startTime = datetime.now()
    pipeLine.execute()
    info('spend time:' + str(datetime.now() - startTime))
