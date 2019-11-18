# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-19 00:05:40
Last Modified: 2019-11-19 00:14:49
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
    data = requests.get(url).json()
    return PackageTool.response_suc(data)
