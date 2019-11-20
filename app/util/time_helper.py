# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-20 21:38:26
Last Modified: 2019-11-21 00:12:02
'''

import datetime

INTERVAL_MAP = {'1m': 60, '5m': 300, '30m': 1800, '1h': 3600, '4h': 14400, '24h': 86400, '7d': 604800}
_INTERVAL_STR_MAP = {
    '1m': '%H:%M',
    '5m': '%H:%M',
    '30m': '%d %H:%M',
    '1h': '%d %H:%M',
    '4h': '%d %H:%M',
    '24h': '%m-%d %H:%M',
    '7d': '%m-%d %H:%M',
}


def convert_to_local_time(time_str, interval, tz=8):
    UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
    utc_time = datetime.datetime.strptime(time_str, UTC_FORMAT)
    return (utc_time + datetime.timedelta(hours=8)).strftime(_INTERVAL_STR_MAP[interval])
