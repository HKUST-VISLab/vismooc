from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule

from ..utils import get_data_by_table

class LogProcessor(PipeModule):
    order = 6

    def __init__(self):
        super().__init__()
        self.sql_table = 'click_events'
        self.events = []
        self.denselogs = {}

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        data = get_data_by_table(self.sql_table)
        return data or None

    def process(self, raw_data, raw_data_filenames=None):
        info("Processing log files")
        all_data_to_be_processed = self.load_data(raw_data_filenames)

        if all_data_to_be_processed is None:
            return raw_data

        field2index = {'path': 5, 'currentTime': 7, 'newTime': 8, 'oldTime': 9, 'newSpeed': 10, 'oldSpeed': 11}
        videos = raw_data['data'][DBc.COLLECTION_VIDEO]
        for row in all_data_to_be_processed:
            event = {}
            # ugly hacked. TODO
            course_id = row[4] if len(row) > 12 else 'HKUSTx/COMP102x/2T2014'
            if '+' in course_id:
                course_id = course_id[course_id.index(':')+1:].replace('+', '/')
            course_id = course_id.replace('/', '_')
            event[DBc.FIELD_LOG_USER_ID] = row[1]
            event[DBc.FIELD_LOG_VIDEO_ID] = row[2]
            event[DBc.FIELD_LOG_COURSE_ID] = course_id
            event_time = row[3]
            event[DBc.FIELD_LOG_TIMESTAMP] = event_time.timestamp()
            event[DBc.FIELD_LOG_TYPE] = row[4]
            event[DBc.FIELD_LOG_METAINFO] = {k: row[v] for (k, v) in field2index.items() if row[v]}
            self.events.append(event)

            denselog_time = datetime(event_time.year, event_time.month,
                                     event_time.day).timestamp()
            video_id = event[DBc.FIELD_LOG_VIDEO_ID]
            denselogs_key = (video_id + str(denselog_time)) if video_id else \
                "none_video_id" + str(denselog_time)

            if self.denselogs.get(denselogs_key) is None:
                self.denselogs[denselogs_key] = {
                    DBc.FIELD_DENSELOGS_COURSE_ID: event[DBc.FIELD_LOG_COURSE_ID],
                    DBc.FIELD_DENSELOGS_TIMESTAMP: denselog_time,
                    DBc.FIELD_DENSELOGS_VIDEO_ID: video_id,
                    DBc.FIELD_DENSELOGS_CLICKS: []
                }
            click = {}
            click[DBc.FIELD_DENSELOGS_USER_ID] = event[DBc.FIELD_LOG_USER_ID]
            click[DBc.FIELD_DENSELOGS_TYPE] = event[DBc.FIELD_LOG_TYPE]
            click.update(event[DBc.FIELD_LOG_METAINFO])
            self.denselogs[denselogs_key][DBc.FIELD_DENSELOGS_CLICKS].append(click)

            date_time = str(event_time.date())
            if videos.get(video_id):
                if date_time not in videos[video_id][DBc.FIELD_VIDEO_TEMPORAL_HOTNESS]:
                    videos[video_id][DBc.FIELD_VIDEO_TEMPORAL_HOTNESS][date_time] = 1
                else:
                    videos[video_id][DBc.FIELD_VIDEO_TEMPORAL_HOTNESS][date_time] += 1

        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_LOG] = self.events
        processed_data['data'][DBc.COLLECTION_DENSELOGS] = list(self.denselogs.values())

        return processed_data
