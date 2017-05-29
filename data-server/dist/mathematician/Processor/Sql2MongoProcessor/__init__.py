'''This processor can process the data in MoocDB then insert them into mongodb
   for vismooc.
'''
from . import course, db, enrollment, forum, grade, log, user, video

__all__ = ['course', 'db', 'enrollment', 'forum', 'grade', 'log', 'user', 'video']
