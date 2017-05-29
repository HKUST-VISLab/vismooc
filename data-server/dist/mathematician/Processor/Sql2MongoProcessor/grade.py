from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule

from ..utils import get_data_by_table

class GradeProcessor(PipeModule):

    order = 5
    grade_types = set(['problem', 'selfassessment'])

    def __init__(self):
        super().__init__()
        self.sql_table = 'grades'
        self.grades = []

    def load_data(self):
        '''
        Load target file
        '''
        data = get_data_by_table(self.sql_table)
        return data or None

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing grade record")
        data_to_be_processed = self.load_data()
        if data_to_be_processed is None:
            return raw_data
        courses = raw_data['data'][DBc.COLLECTION_COURSE]

        for row in data_to_be_processed:
            grade = {}
            grade[DBc.FIELD_GRADES_USER_ID] = row[1]
            course_id = row[2]
            if '+' in course_id:
                course_id = course_id[course_id.index(':')+1:].replace('+', '/')
            course_id = course_id.replace('/', '_')
            grade[DBc.FIELD_GRADES_COURSE_ID] = course_id
            grade[DBc.FIELD_GRADES_TIMESTAMP] = row[3].timestamp() if isinstance(row[3], datetime) else None
            grade[DBc.FIELD_GRADES_GRADE] = float(row[4])

            if courses.get(grade[DBc.FIELD_GRADES_COURSE_ID]):
                original_grade = courses[grade[DBc.FIELD_GRADES_COURSE_ID]][
                    DBc.FIELD_COURSE_GRADES].setdefault(grade[DBc.FIELD_GRADES_USER_ID], 0)
                new_grade = original_grade + grade[DBc.FIELD_GRADES_GRADE]
                courses[grade[DBc.FIELD_GRADES_COURSE_ID]][DBc.FIELD_COURSE_GRADES][
                    grade[DBc.FIELD_GRADES_USER_ID]] = new_grade

            self.grades.append(grade)

        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_COURSE] = courses

        return processed_data
