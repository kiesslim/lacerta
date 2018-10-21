#!/usr/bin/python3.6

from lxml import etree
from lxml import html
from lxml.html.clean import Cleaner
import requests
import sys
from urllib.parse import urldefrag, urlparse, urlsplit, urljoin


class Web:
    def __init__(self, url):
        # TODO: add error handling for URL
        self.validate_url(url)
        self.url = self.normalize(url)
        self.response = self.get_response()
        self.html = self.get_html()
        self.urls = set()
        self.get_urls_from_html()
        self.title = self.get_title_from_html()

    def normalize(self, url):
        result = urlsplit(url)
        return urldefrag(result.geturl())[0]

    def is_absolute(self, url):
        return bool(urlparse(url).netloc)

    def absolute_url(self, url):
        return urljoin(self.url, url)

    def get_html(self):
        return html.fromstring(self.response.content)

    def get_response(self):
        return requests.get(self.url)

    ''' remove styling/javascript/scripts before parsing '''
    #TODO: fix bug www.mysite.org AND www.mysite.org/ both return
    def get_urls_from_html(self):
        cleaner = Cleaner()
        cleaner.javascript = True
        cleaner.scripts = True
        cleaner.style = True
        cleaned = html.fromstring(cleaner.clean_html(self.response.content))
        raw_urls = cleaned.xpath('//a/@href')
        return [self.urls.add(self.absolute_url(self.normalize(url))) for url in raw_urls]

    def get_title_from_html(self):
        return self.html.findtext('.//title')

    #TODO:add error handling. raise ValueError or exception?
    # note: this may not be needed. Invalid urls could just be represented as
    # dead-end nodes
    def validate_url(self, url):
        components = urlparse(url)
        return components.scheme and components.netloc


# TODO: remove main and store in class
if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Missing Script Argument: html-parser.py [url]')
    start_url = sys.argv[1]
    web = Web(start_url)
    for url in web.urls:
        print(url)
        w = Web(url)
        print(w.title)
