import json
import multiprocessing
import re
from datetime import datetime

from mathematician.config import DBConfig as DBc
from mathematician.logger import info
from mathematician.pipe import PipeModule
from mathematician.Processor.utils import PARALLEL_GRAIN, get_cpu_num, is_processed


class LogProcessor(PipeModule):

    order = 6

    def __init__(self):
        super().__init__()
        self.processed_files = []
        self.events = []
        self.denselogs = {}

    def load_data(self, data_filenames):
        '''
        Load target file
        '''
        for filename in data_filenames:
            if '-clickstream' in filename and not is_processed(filename):
                with open(filename, 'r', encoding='utf-8') as file:
                    raw_data = file.readlines()
                    self.processed_files.append(filename)
                    yield raw_data

    @classmethod
    def process_few_logs(cls, lines):
        '''Process one piece of log
        '''
        pattern_wrong_username = r'"username"\s*:\s*"",'
        pattern_right_eventsource = r'"event_source"\s*:\s*"browser"'
        pattern_right_eventtype = r'"event_type"\s*:\s*"(hide_transcript|load_video|' + \
            r'pause_video|play_video|seek_video|show_transcript|speed_change_video|stop_video|' + \
            r'video_hide_cc_menu|video_show_cc_menu)"'

        pattern_context = r',?\s*("context"\s*:\s*{[^}]*})'
        pattern_event = r',?\s*("event"\s*:\s*"([^"]|\\")*(?<!\\)")'
        pattern_username = r',?\s*("username"\s*:\s*"[^"]*")'
        pattern_time = r',?\s*("time"\s*:\s*"[^"]*")'
        pattern_event_json_escape_ = r'"(?={)|"$'
        pattern_hash = r'[0-9a-f]{32}'

        re_wrong_username = re.compile(pattern_wrong_username)
        re_right_eventsource = re.compile(pattern_right_eventsource)
        re_right_eventtype = re.compile(pattern_right_eventtype)
        re_context = re.compile(pattern_context)
        re_event = re.compile(pattern_event)
        re_username = re.compile(pattern_username)
        re_time = re.compile(pattern_time)
        re_event_json_escape = re.compile(pattern_event_json_escape_)
        re_pattern_hash = re.compile(pattern_hash)
        pattern_time = "%Y-%m-%dT%H:%M:%S.%f+00:00"

        events = []
        for line in lines:
            event_type = re_right_eventtype.search(line)
            if  event_type is not None and \
                re_right_eventsource.search(line) is not None and \
                re_wrong_username.search(line) is None:

                context = re_context.search(line)
                event_field = re_event.search(line)
                username = re_username.search(line)
                timestamp = re_time.search(line)
                temp_data = [event_type.group()]
                if context is not None:
                    temp_data.append(context.group(1))
                if event_field is not None:
                    temp_data.append(re_event_json_escape.sub(
                        '', event_field.group(1).replace('\\', '')))
                if username is not None:
                    temp_data.append(username.group(1))
                if timestamp is not None:
                    temp_data.append(timestamp.group(1))
                str_temp_data = "{" + ",".join(temp_data) + "}"
                str_temp_data = str_temp_data.replace('.,', ',', 1)
                temp_data = json.loads(str_temp_data)
                event = {}
                event_context = temp_data.get('context') or {}
                event_event = temp_data.get('event') or {}

                video_id = event_event.get('id')
                if video_id:
                    video_id = re_pattern_hash.search(video_id).group()
                str_event_time = temp_data.get('time')
                if '.' not in str_event_time:
                    str_event_time = str_event_time[:str_event_time.index("+")] + \
                        '.000000' + \
                        str_event_time[str_event_time.index("+"):]
                event_time = datetime.strptime(
                    str_event_time, pattern_time)
                event[DBc.FIELD_LOG_USER_ID] = event_context.get(
                    'user_id')
                event[DBc.FIELD_LOG_VIDEO_ID] = video_id
                course_id = event_context.get('course_id')
                if '+' in course_id:
                    course_id = course_id[course_id.index(':')+1:].replace('+', '/')
                course_id = course_id.replace('/', '_')
                event[DBc.FIELD_LOG_COURSE_ID] = course_id
                event[DBc.FIELD_LOG_TIMESTAMP] = event_time.timestamp()
                event[DBc.FIELD_LOG_TYPE] = temp_data.get(
                    'event_type')

                target_attrs = {'path': 'path', 'code': 'code',
                                'currentTime': 'currentTime', 'new_time': 'newTime',
                                'old_time': 'oldTime', 'new_speed': 'newSpeed',
                                'old_speed': 'oldSpeed'}
                event[DBc.FIELD_LOG_METAINFO] = {target_attrs[k]: event_event.get(
                    k) for k in target_attrs if event_event.get(k) is not None}
                event[DBc.FIELD_LOG_METAINFO][
                    'path'] = event_context.get('path')
                events.append(event)

        return events


    def process(self, raw_data, raw_data_filenames=None):
        info("Processing log files")
        all_data_to_be_processed = self.load_data(raw_data_filenames)
        
        if all_data_to_be_processed is None:
            return raw_data
        cpu_num = get_cpu_num()
        videos = raw_data['data'][DBc.COLLECTION_VIDEO]
        for data_to_be_processed in all_data_to_be_processed:
            data = [data_to_be_processed[l: l+PARALLEL_GRAIN] for l in range(0, len(data_to_be_processed), PARALLEL_GRAIN)]
            pool = multiprocessing.Pool(processes=cpu_num)
            results = pool.map_async(FormatLogFile.process_few_logs, data)
            pool.close()
            pool.join()
            for few_events in results.get():
                if len(few_events) > 0:
                    self.events.extend(few_events)
                    for event in few_events:
                        event_time = datetime.fromtimestamp(event[DBc.FIELD_LOG_TIMESTAMP])
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
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        return processed_data
