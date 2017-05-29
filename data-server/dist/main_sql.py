from datetime import datetime
from mathematician.pipe import PipeLine
from mathematician.logger import info
from mathematician.Processor.Sql2MongoProcessor import *

def main():
    pipeLine = PipeLine()
    pipeLine.input_files([]).pipe(CourseProcessor()).pipe(VideoProcessor()).pipe(
        EnrollmentProcessor()).pipe(LogProcessor()).pipe(UserProcessor()).pipe(
            ForumProcessor()).pipe(GradeProcessor()).pipe(DBProcessor())
    startTime = datetime.now()
    pipeLine.execute()
    info('spend time:' + str(datetime.now() - startTime))

if __name__ == "__main__":
    main()

