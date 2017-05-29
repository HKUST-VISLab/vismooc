import json
import re
from datetime import datetime
from urllib.parse import urlencode

import queue
from mathematician.config import DBConfig as DBc
from mathematician.http_helper import get_list as http_get_list
from mathematician.logger import info, warn
from mathematician.pipe import PipeModule
from mathematician.Processor.utils import (YOUTUBE_KEY, fetch_video_duration,
                                           parse_duration_from_youtube_api)

class CourseProcessor(PipeModule):
    '''Processe -course_structure- file
    '''
    order = 0

    def __init__(self):
        super().__init__()
        youtube_api_host = 'https://www.googleapis.com/youtube/v3/videos'
        params = {"part": "contentDetails", "key": YOUTUBE_KEY}
        self.youtube_api = youtube_api_host + '?' + urlencode(params)
        self.videos = {}
        self.courses = {}
        self.processed_files = []

        pattern_hash = r'[0-9a-f]{32}'
        self.re_pattern_hash = re.compile(pattern_hash)

    def load_data(self, data_filenames):
        '''Load target file
        '''
        for filename in data_filenames:
            if "-course_structure-" in filename:
                with open(filename, 'r', encoding='utf-8') as file:
                    raw_data = ''.join(file.readlines())
                    raw_data = self.add_prefix(raw_data)
                    self.processed_files.append(filename)
                    yield raw_data

    def add_prefix(self, raw_data):
        try:
            course_structure_info = json.loads(raw_data)
        except json.JSONDecodeError:
            warn("json.loads -course_structure- failed")
            return raw_data

        section_sep = ">>"
        target_block_type = set(["course", "chapter", "sequential", "vertical", "video"])
        block_id_to_keep = set(course_structure_info.keys())
        block_queue = queue.Queue()
        # construct a dictory which contains all blocks and get the
        # root course block
        for block_id in course_structure_info:
            if course_structure_info.get(block_id).get("category") == "course":
                block_queue.put(block_id)
                # courses[course_id] = block
        # fill in the children field
        while not block_queue.empty():
            block_id = block_queue.get()
            block = course_structure_info.get(block_id)
            if block is None:
                continue
            block.pop("edit_info", None)
            block_type = block.get("category")
            prefix = block.get("prefix") or ""
            parent = block.get("parent") or block
            children = block.get("children")
            if not children:
                continue
            # construct new_children
            new_children = []
            for c_idx, child_id in enumerate(children):
                child_one = course_structure_info.get(child_id)
                if child_one is None or child_one.get('category') not in target_block_type:
                    continue
                display_name = child_one.get('metadata') and (child_one['metadata'].get('display_name') or "")
                child_one["parent"] = parent
                child_one["prefix"] = prefix + str(c_idx) + section_sep +\
                    str(display_name) + section_sep
                new_children.append(child_one)
                block_queue.put(child_id)
                # course_structure_info.remove(child_one)
            # assign new_children to parent
            if block_type == "course":
                parent["children"] = new_children
            else:
                # course_structure_info.pop(block.get(''))
                block_id_to_keep.remove(block_id)
                parent["children"].remove(block)
                parent["children"].extend(new_children)

        course_structure_info = {k: course_structure_info[k] for k in
                                 course_structure_info if k in block_id_to_keep}
        return course_structure_info

    def process(self, raw_data, raw_data_filenames=None):
        '''Processe course record
        '''
        info("Processing course record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data

        for course_structure_info in data_to_be_processed:
            # try:
            #     course_structure_info = json.loads(data)
            # except json.JSONDecodeError:
            #     warn("json.loads -course_structure- failed")
            #     return raw_data
            course_videos = {}
            pattern_time = "%Y-%m-%dT%H:%M:%SZ"
            for key in course_structure_info:
                value = course_structure_info[key]
                metadata = value.get('metadata') or {}
                if value['category'] == 'video':
                    video = {}
                    video_id = self.re_pattern_hash.search(key).group()

                    video[DBc.FIELD_VIDEO_NAME] = metadata.get('display_name')
                    video[DBc.FIELD_VIDEO_TEMPORAL_HOTNESS] = {}
                    video[DBc.FIELD_VIDEO_METAINFO] = {}
                    # video[DBc.FIELD_VIDEO_SECTION] = metadata.get('sub')
                    video[DBc.FIELD_VIDEO_SECTION] = value.get('prefix')
                    video[DBc.FIELD_VIDEO_RELEASE_DATE] = None
                    video[DBc.FIELD_VIDEO_URL] = (len(metadata.get('html5_sources')) and
                                                  metadata.get('html5_sources')[0]) or metadata.get('edx_video_id')
                    video[DBc.FIELD_VIDEO_DURATION] = None
                    video[DBc.FIELD_VIDEO_ORIGINAL_ID] = video_id
                    video[DBc.FIELD_VIDEO_METAINFO]['youtube_id'] = metadata.get('youtube_id_1_0')
                    self.videos[video_id] = video
                    course_videos[video_id] = video
                elif value['category'] == 'course':
                    if '+' in key:
                        course_compon = key[9:].split('+')
                        course_compon = course_compon[:3]
                        course_compon.append(course_compon[2])
                    else:
                        course_compon = key[6:].split('/')
                    org = course_compon[0]
                    course_id = course_compon[0] + '_' + course_compon[1] + '_' + course_compon[3]
                    course = {}
                    start_time = metadata.get('start')
                    start_time = datetime.strptime(start_time, pattern_time) if start_time else None
                    end_time = metadata.get('end')
                    end_time = datetime.strptime(end_time, pattern_time) if end_time else None
                    course[DBc.FIELD_COURSE_ORG] = org
                    course[DBc.FIELD_COURSE_ORIGINAL_ID] = course_id
                    course[DBc.FIELD_COURSE_NAME] = metadata.get('display_name')
                    course_year = start_time and str(start_time.year)
                    period = course_compon[3][course_compon[3].index('Q') - 1:course_compon[3].index('Q')] \
                        if 'Q' in course_compon[3] else '0'
                    run = course_compon[3][course_compon[3].index('R') - 1:course_compon[3].index('R')] \
                        if 'R' in course_compon[3] else '0'
                    course[DBc.FIELD_COURSE_YEAR] = '%s_Q%s_R%s' % (course_year, period, run)
                    course[DBc.FIELD_COURSE_IMAGE_URL] = metadata.get('course_image')
                    course[DBc.FIELD_COURSE_ENROLLMENT_START] = None
                    course[DBc.FIELD_COURSE_ENROLLMENT_END] = None
                    course[DBc.FIELD_COURSE_INSTRUCTOR] = []
                    course[DBc.FIELD_COURSE_STATUS] = None
                    course[DBc.FIELD_COURSE_URL] = None
                    course[DBc.FIELD_COURSE_DESCRIPTION] = None
                    course[DBc.FIELD_COURSE_METAINFO] = {}
                    course[DBc.FIELD_COURSE_STARTTIME] = start_time and start_time.timestamp()
                    course[DBc.FIELD_COURSE_ENDTIME] = end_time and end_time.timestamp()
                    course[DBc.FIELD_COURSE_STUDENT_IDS] = set()
                    course[DBc.FIELD_COURSE_VIDEO_IDS] = set()
                    course[DBc.FIELD_COURSE_GRADES] = {}

                    self.courses[course_id] = course
            temp_youtube_video_dict = {}
            temp_other_video_dict = {}
            for video in course_videos.values():
                # video collection is completed
                # course collection needs studentIds
                video_id = video[DBc.FIELD_VIDEO_ORIGINAL_ID]
                course[DBc.FIELD_COURSE_VIDEO_IDS].add(video_id)
                youtube_id = video[DBc.FIELD_VIDEO_METAINFO].get('youtube_id')
                if youtube_id is not None:
                    temp_youtube_video_dict[youtube_id] = video
                else:
                    temp_other_video_dict.setdefault(video[DBc.FIELD_VIDEO_URL], []).append(video_id)

            video_youtube_ids = temp_youtube_video_dict.keys()
            # fetch the video duration from youtube_api_v3
            urls = [self.youtube_api + '&id=' + youtube_id for youtube_id in video_youtube_ids]
            broken_youtube_id = set([youtube_id for youtube_id in video_youtube_ids])
            results = http_get_list(urls, limit=60)
            for result in results:
                try:
                    result = json.loads(str(result, 'utf-8'))
                except json.JSONDecodeError:
                    warn("decode json failed in youtube's response, " + result)
                    continue

                item = None
                try:
                    item = result["items"][0]
                    video_id = item["id"]
                except KeyError:
                    warn("get video id failed in youtube's response, " + result)
                    continue
                except IndexError:
                    warn("no item in youtube's response, " + str(result))
                    continue

                broken_youtube_id.discard(video_id)
                video = temp_youtube_video_dict[video_id]
                try:
                    duration = parse_duration_from_youtube_api(item["contentDetails"]["duration"])
                except KeyError:
                    warn("get video duration failed in youtube's response," + result)
                    continue

                video[DBc.FIELD_VIDEO_DURATION] = int(duration.total_seconds())

            for url in temp_other_video_dict:
                duration = fetch_video_duration(url)
                video_ids = temp_other_video_dict[url]
                for video_id in video_ids:
                    course_videos[video_id][DBc.FIELD_VIDEO_DURATION] = duration

            if len(self.videos) == 0:
                warn("VIDEO:No video in data!")
            if len(course.keys()) == 0:
                warn("COURSE:No course in data!")

        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_VIDEO] = self.videos
        processed_data['data'][DBc.COLLECTION_COURSE] = self.courses
        processed_data.setdefault('processed_files', []).extend(self.processed_files)

        if len(broken_youtube_id) > 0:
            with open("./broken_youtube_id.log", "w+") as file:
                file.write(str(broken_youtube_id))
        return processed_data
