#!/usr/bin/python3.6

from bs4 import BeautifulSoup
from lxml import html
import requests
import sys


# EX: www.baseurl.com/somestuff/morestuff/1 returns www.baseurl.com/somestuff/morestuff
def base(url):
    return  url.rsplit('/', 1)[0]

# TODO: Remove url fragments and make urls consistent
def normalize(url):
    return

# TODO: make relative URLS absolute
def make_absolute(url):
    return

def get_urls_from(url):
    # TODO: add URL error handling. verify valid url, and status code!
    response = requests.get(url)
    html_doc = html.fromstring(response.content)
    urls = html_doc.xpath('//a/@href')
    #TODO: normalize all URLS. make relative urls absolute and filter urls to headers within same page
    #TODO: defrag urls (remove#header tags)
    return urls

# TODO: remove main and store in class
if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Missing Script Argument: html-parser.py [url]')
    start_url = sys.argv[1]
    urls2 = get_urls_from(start_url)
    print(*urls2, sep='\n')
    print(base(start_url))
