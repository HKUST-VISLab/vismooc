'''Http helper
'''
import urllib.request
from urllib.parse import urlencode
import os
from os import path as path
import multiprocessing
import json
import time
# import datetime
import hashlib
import ssl
import asyncio
import aiohttp
from .logger import info, warn, progressbar

def head(url, headers=None, params=None, retry_time=5, delay=1):
    """Send synchronous head request
    """
    headers = headers or {}
    if params is not None:
        if isinstance(params, dict):
            url = url + '?' + urlencode(params)
            # for key in params:
            #     url = url + key + '=' + str(params[key]) + '&'
            # url = url[0: -1]
        else:
            raise TypeError("The params should be dict type")

    context = ssl.create_default_context()
    url = urllib.request.quote(url.encode('utf8'), ':/%?=&')
    req = urllib.request.Request(url=url, headers=headers, method='GET')
    for attempt_number in range(retry_time):
        try:
            info("Try " + str(attempt_number) + "th times to HEAD " + url + ".")
            response = urllib.request.urlopen(req, context=context, timeout=100)
        except urllib.error.HTTPError as ex:
            warn("HTTP HEAD error " + str(ex.getcode()) + " at " + url)
            time.sleep(delay)
        else:
            response_headers = response.info()
            return_code = response.getcode()
            response.close()
            return HttpResponse(return_code, response_headers, None)


def get(url, headers=None, params=None, retry_times=5, delay=1):
    """Send synchronous get request
    """
    headers = headers or {}
    if params is not None:
        if isinstance(params, dict):
            url = url + '?' + urlencode(params)
            # for key in params:
            #     url = url + key + '=' + str(params[key]) + '&'
            # url = url[0: -1]
        else:
            raise TypeError("The params should be dict type")

    context = ssl.create_default_context()
    url = urllib.request.quote(url.encode('utf8'), ':/%?=&')
    req = urllib.request.Request(url=url, headers=headers, method='GET')
    for attempt_number in range(retry_times):
        try:
            info("Try " + str(attempt_number) + "th times to GET " + url + ".")
            response = urllib.request.urlopen(req, context=context)
        except urllib.error.HTTPError as ex:
            warn("HTTP GET error " + str(ex.getcode()) + " at " + url)
            time.sleep(delay)
        else:
            data = response.read()
            response_headers = response.info()
            return_code = response.getcode()
            return HttpResponse(return_code, response_headers, data)


def post(url, headers=None, params=None, retry_times=5, delay=1):
    """Send synchronous post request

    """
    headers = headers or {}
    if params is not None and isinstance(params, dict) is False:
        raise TypeError("The params should be dict type")

    req = urllib.request.Request(url=url, headers=headers, data=params, method='POST')
    for attempt_number in range(retry_times):
        try:
            info("Try " + str(attempt_number) + "th times to POST " + url + ".")
            response = urllib.request.urlopen(req)
        except urllib.error.HTTPError as ex:
            warn("HTTP POST error " + str(ex.getcode()) + " at " + url)
            time.sleep(delay)
        else:
            data = response.read()
            response_headers = response.info()
            return_code = response.getcode()
            return HttpResponse(return_code, response_headers, data)

async def async_get(url, headers=None, params=None, session=aiohttp):
    """Out of dated
        Send asynchronous get request
        Example for use:
            http_test = HttpHelper("http://www.google.com")
            loop = asyncio.get_event_loop()
            content = loop.run_until_complete(
                http_test.async_get("/"))
            print(content)
            loop.close()
    """
    if params is not None:
        if isinstance(params, dict) is False:
            raise TypeError("The params should be dict type")

    async with session.get(url, headers=headers, params=params) as response:
        assert response.status >= 200 and response.status < 300
        data = await response.read()
        return HttpResponse(response.status, response.headers, data)

def get_list(urls, limit=30, headers=None, params=None):
    '''Get a list of urls async
    '''
    loop = asyncio.get_event_loop()
    results = []
    with aiohttp.ClientSession(loop=loop) as session:
        for i in range(0, len(urls), limit):
            tasks = [asyncio.ensure_future(async_get(url, headers, params, session))
                     for url in urls[i:i + limit]]
            results += loop.run_until_complete(asyncio.gather(*tasks))
    return [result.get_content() for result in results]

class HttpResponse():
    """ Encapsulate http response headers, content, and status code in this class
    """

    def __init__(self, return_code, headers, content):
        self.__return_code = return_code
        self.__headers = headers
        self.__content = content

    def get_headers(self):
        """ return the response headers
        """
        return self.__headers or {}

    def get_content(self):
        """ return the response content in bytes
        """
        return self.__content

    def get_return_code(self):
        """ return the response status code
        """
        return self.__return_code

    def get_content_json(self, encode="UTF-8"):
        """ return the response content in json
        """
        try:
            json_results = json.loads(str(self.__content, encode))
        except json.decoder.JSONDecodeError as ex:
            print("In get_content_json(), cannot decode the content of http response")
            print(ex.msg)
        else:
            return json_results
