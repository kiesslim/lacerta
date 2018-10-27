#!/usr/bin/python3.6

from flask import Flask
from flask_dynamo import Dynamo
import json
import decimal

def view(dynamodb):
    return list(dynamodb.tables.items())

def add_item(dynamodb, url, data):
    dynamodb.tables['lacerta'].put_item(Item={
        'url': url,
        'data':data
    })

def get_item(dynamodb, url):
    response = dynamodb.tables['lacerta'].get_item(Key={
        'url': url
    })
    return response["Item"]

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)
