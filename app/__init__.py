# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-17 23:57:38
Last Modified: 2019-11-18 00:07:42
'''

from flask import Flask


app = Flask(__name__)

from app.views import hello
