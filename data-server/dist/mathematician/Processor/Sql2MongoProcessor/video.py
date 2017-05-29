import json
from urllib.parse import urlencode

from mathematician.config import DBConfig as DBc
from mathematician.http_helper import get_list as http_get_list
from mathematician.logger import info, warn
from mathematician.pipe import PipeModule

from ..utils import (YOUTUBE_KEY, fetch_video_duration, get_data_by_table,
                     parse_duration_from_youtube_api)

class VideoProcessor(PipeModule):
    '''Processe video table
    '''
    order = 1

    def __init__(self):
        super().__init__()
        self.sql_table = 'videos'
        youtube_api_host = 'https://www.googleapis.com/youtube/v3/videos'
        params = {"part": "contentDetails", "key": YOUTUBE_KEY}
        self.youtube_api = youtube_api_host + '?' + urlencode(params)
        self.videos = {}

    def load_data(self, data_filenames):
        '''Load target table
        '''
        data = get_data_by_table(self.sql_table)
        return data or None

    def process(self, raw_data, raw_data_filenames=None):
        '''Processe video record
        '''
        info("Processing course record")
        data_to_be_processed = self.load_data(raw_data_filenames)
        if data_to_be_processed is None:
            return raw_data

        for row in data_to_be_processed:
            video = {}
            video_id = row[1]

            video[DBc.FIELD_VIDEO_NAME] = row[2]
            video[DBc.FIELD_VIDEO_SECTION] = row[3]
            video[DBc.FIELD_VIDEO_TEMPORAL_HOTNESS] = {}
            video[DBc.FIELD_VIDEO_METAINFO] = {}
            video[DBc.FIELD_VIDEO_RELEASE_DATE] = None
            video[DBc.FIELD_VIDEO_URL] = row[5]
            video[DBc.FIELD_VIDEO_DURATION] = None
            video[DBc.FIELD_VIDEO_ORIGINAL_ID] = video_id
            # video[DBc.FIELD_VIDEO_METAINFO]['youtube_id'] = row[6]
            self.videos[video_id] = video

        temp_youtube_video_dict = {}
        temp_other_video_dict = {}
        for video in self.videos.values():
            # video collection is completed
            # course collection needs studentIds
            video_id = video[DBc.FIELD_VIDEO_ORIGINAL_ID]
            # course[DBc.FIELD_COURSE_VIDEO_IDS].add(video_id)
            youtube_id = video[DBc.FIELD_VIDEO_METAINFO].get('youtube_id')
            if youtube_id is not None:
                temp_youtube_video_dict[youtube_id] = video
            elif video[DBc.FIELD_VIDEO_URL]:
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
                warn("decode json failed in youtube's response, "+ result)
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
                self.videos[video_id][DBc.FIELD_VIDEO_DURATION] = duration

        if len(self.videos) == 0:
            warn("VIDEO:No video in data!")

        processed_data = raw_data
        processed_data['data'][DBc.COLLECTION_VIDEO] = self.videos

        if len(broken_youtube_id) > 0:
            with open("./broken_youtube_id.log", "w+") as file:
                file.write(str(broken_youtube_id))
        return processed_data
