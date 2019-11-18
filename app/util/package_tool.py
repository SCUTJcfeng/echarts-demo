# !/usr/bin/python3
# -*- coding:utf-8 -*-
'''
Author: jc feng
File Created: 2019-11-19 00:07:42
Last Modified: 2019-11-19 00:11:46
'''

from flask import jsonify, make_response


class PackageTool:
    @staticmethod
    def response_suc(data=''):
        return PackageTool.build_response(0, data)

    @staticmethod
    def response_err(error_code, data='', error_info=''):
        return PackageTool.build_response(error_code, data, error_info)

    @staticmethod
    def build_response(error_code, data, error_info=''):
        resp_data = {'errorcode': error_code, 'errorinfo': error_info, 'data': data, 'datatype': 'json'}
        resp = make_response(jsonify(resp_data))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
