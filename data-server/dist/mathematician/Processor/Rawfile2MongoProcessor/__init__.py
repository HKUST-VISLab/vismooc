'''This processor can process the raw data files then insert them into mongodb
   for vismooc.
'''
from . import course, course_role, db, enrollment, forum, grade, log, user, meta_info

__all__ = ['course', 'course_role', 'db', 'enrollment', 'forum', 'grade', 'log', 'user', 'meta_info']
