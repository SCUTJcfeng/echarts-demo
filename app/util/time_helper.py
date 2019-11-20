# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-20 21:38:26
Last Modified: 2019-11-20 22:06:29
'''

import datetime


def convert_to_local_time(time_str, tz=8):
    UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
    utc_time = datetime.datetime.strptime(time_str, UTC_FORMAT)
    return (utc_time + datetime.timedelta(hours=8)).strftime('%H:%M')
