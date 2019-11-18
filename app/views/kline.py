# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-19 00:05:40
Last Modified: 2019-11-19 01:19:52
'''


import requests
from flask import request

from app import app
from app.util import proxy
from app.util.package_tool import PackageTool


INTERVAL_MAP = {'1m': 60, '5m': 300, '30m': 1800, '1h': 3600}


@app.route('/api/kline/okex/contracts', methods=['GET'])
def get_okex_contracts():
    url = 'https://www.okex.com/api/futures/v3/instruments'
    data_list = requests.get(url).json()
    contract_list = [d['instrument_id'] for d in data_list]
    return PackageTool.response_suc(contract_list)


@app.route('/api/kline/okex/future', methods=['GET'])
def get_kline():
    contract = request.args.get('contract', '')
    interval = request.args.get('interval', '')
    url = f'https://www.okex.com/api/futures/v3/instruments/{contract}/candles?granularity={INTERVAL_MAP[interval]}'
    data_list = requests.get(url).json()
    result = calc_golden_finger(data_list)
    return PackageTool.response_suc(result)


# 临时
def calc_golden_finger(data_list):
    index = -1
    for data in data_list:
        data.append(index)
        index = -index
    return data_list
