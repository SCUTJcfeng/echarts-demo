# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-19 00:10:27
Last Modified: 2019-11-19 00:10:31
'''

import os
import platform


if platform.system() == "Windows":
    os.environ['http_proxy'] = "http://127.0.0.1:10800"
    os.environ['https_proxy'] = "http://127.0.0.1:10800"
