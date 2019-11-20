# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-19 00:05:40
Last Modified: 2019-11-21 01:06:59
'''


import requests
from flask import request

from app import app
from app.util import proxy
from app.util.package_tool import PackageTool
from app.util.time_helper import convert_to_local_time, INTERVAL_MAP, str_to_datetime


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
    new_data_list = []
    for data in data_list[::-1]:
        ts, o, h, l, c, v, cv = data
        new_data_list.append(
            [convert_to_local_time(ts, interval), float(o), float(c), float(l), float(h), int(v), float(cv)]
        )
    if interval in ['5m', '30m', '1h', '4h', '1d'] and contract.find('BTC') != -1:
        result = combine_golden_finger(new_data_list, interval)
    else:
        result = calc_golden_finger(new_data_list)
    return PackageTool.response_suc(result)


def combine_golden_finger(data_list, interval):
    ap_data_list = get_ap_coin_data('btc', interval)
    if len(ap_data_list) > len(data_list):
        ap_data_list = ap_data_list[: len(data_list)]
    elif len(ap_data_list) < len(data_list):
        for i in range(len(data_list) - len(ap_data_list)):
            ap_data_list.append({'feature': '', 'trade_date': '19/11/19 23:40'})
    index = 0
    # for data in data_list:
    #     ap_data = ap_data_list[index]
    #     ap_time, ok_time = str_to_datetime(ap_data['trade_date']), str_to_datetime(data[0])
    #     feature = ap_data_list[index]['feature'] if ap_time == ok_time else ''
    #     data.append(feature)
    #     index += 1
    for data in data_list:
        data.append(ap_data_list[index]['feature'])
        index += 1
    return data_list


def get_ap_coin_data(symbol, interval):
    # 5m 30m 1h 4h 1d
    url = f'https://mct.ap-coin.com/currency/kmagic?use_last=on&symbol={symbol}_us&line_type=golden_finger&bar_interval=30m'
    data = requests.get(url).json()
    return data['data']['data']


# 临时
def calc_golden_finger(data_list):
    index = -1
    for data in data_list:
        data.append(index)
        index = -index
    return data_list
