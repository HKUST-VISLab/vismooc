import multiprocessing
from datetime import datetime
from mathematician.pipe import PipeModule
from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.Processor.utils import PARALLEL_GRAIN, get_cpu_num

class GradeProcessor(PipeModule):

    order = 5
    grade_types = set(['problem', 'selfassessment'])

    def __init__(self):
        super().__init__()
        self.grades = []
        self.processed_files = []

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        for filename in data_filenames:
            if '-courseware_studentmodule-' in filename:
                with open(filename, 'r', encoding='utf-8') as file:
                    next(file)
                    raw_data = file.readlines()
                    self.processed_files.append(filename)
                    yield raw_data

    @classmethod
    def process_few_grades(cls, rows):
        ''' Process one row of records
        '''
        grades = []
        pattern_time = "%Y-%m-%d %H:%M:%S"
        for row in rows:
            row = row[:-1].split('\t')
            grade = {}
            if row[1] not in GradeProcessor.grade_types:
                continue
            grade[DBc.FIELD_GRADES_USER_ID] = row[3]
            course_id = row[10]
            if '+' in course_id:
                course_id = course_id[course_id.index(':')+1:].replace('+', '/')
            course_id = course_id.replace('/', '_')
            grade[DBc.FIELD_GRADES_COURSE_ID] = course_id
            grade[DBc.FIELD_GRADES_TIMESTAMP] = datetime.strptime(
                row[7], pattern_time).timestamp()
            grade[DBc.FIELD_GRADES_COURSE_MODULE] = row[2]
            grade[DBc.FIELD_GRADES_GRADE] = float(row[5]) if \
                row[5].replace('.', '', 1).isdigit() else 0
            grades.append(grade)

        return grades

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing grade record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data
        courses = raw_data['data'][DBc.COLLECTION_COURSE]
        cpu_num = get_cpu_num()

        for data in data_to_be_processed:
            data = [data[l: l + PARALLEL_GRAIN] for l in range(0, len(data), PARALLEL_GRAIN)]
            pool = multiprocessing.Pool(processes=cpu_num)
            results = pool.map_async(GradeProcessor.process_few_grades, data)
            pool.close()
            pool.join()
            for result in results.get():
                if len(result) > 0:
                    self.grades.extend(result)
                    for grade in result:
                        if courses.get(grade[DBc.FIELD_GRADES_COURSE_ID]):
                            original_grade = courses[grade[DBc.FIELD_GRADES_COURSE_ID]][
                                DBc.FIELD_COURSE_GRADES].setdefault(grade[DBc.FIELD_GRADES_USER_ID], 0)
                            new_grade = original_grade + grade[DBc.FIELD_GRADES_GRADE]
                            courses[grade[DBc.FIELD_GRADES_COURSE_ID]][DBc.FIELD_COURSE_GRADES][
                                grade[DBc.FIELD_GRADES_USER_ID]] = new_grade

        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_COURSE] = courses
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        return processed_data
