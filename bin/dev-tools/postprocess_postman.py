#!/usr/bin/env python3
import json
import sys


def postprocess_postman(src_path, dest_path):
    with open(src_path, "r") as json_file:
        data = json.load(json_file)

    iterate_over_nested_items(data['item'])

    with open(dest_path, "w") as json_file:
        json.dump(data, json_file)


def iterate_over_nested_items(calls):
    if isinstance(calls, list):
        for call in calls:
            iterate_over_nested_items(call)

    if 'item' in calls:
        if not isinstance(calls['item'], list):
            iterate_over_nested_items(calls['item'])
        else:
            for call in calls['item']:
                iterate_over_nested_items(call)

    elif not isinstance(calls, list):
        add_header(calls)


def add_header(call):
    if 'header' in call['request']:
        call['request']['header'].append({
            "key": "Accept",
            "value": "application/json"
        })
    else:
        call['request']['header'] = [{
            "key": "Accept",
            "value": "application/json"
        }]
    return call['request']

postprocess_postman(sys.argv[1], sys.argv[2])
