#!/usr/bin/python3.6

from lxml import etree
from lxml import html
from lxml.html.clean import Cleaner
from random import shuffle
import requests
import sys
from urllib.parse import urldefrag, urlparse, urlsplit, urljoin

#TODO: error handling & get_text from html!
class Web:
    def __init__(self, url):
        print(url)
        if not validate_url(url):
            raise ValueError('Invalid  URL: URL {} is invalid'.format(url))
            return None
        r = get_response(url)
        if r.status_code is not 200:
            return None
        self.url = self.normalize(url)
        self.response = r
        self.status_code = self.response.status_code
        self.urls = set()
        self.html = self.get_html()
        self.get_urls_from_html()
        self.title = self.get_title_from_html()

    # TODO: remove query strings!!
    def normalize(self, url):
        result = urlsplit(url)
        return urldefrag(result.geturl())[0]

    def is_absolute(self, url):
        return bool(urlparse(url).netloc)

    def absolute_url(self, url):
        return urljoin(self.url, url)

    def get_html(self):
        if self.status_code is 200 and self.response.content:
            return html.fromstring(self.response.content)
        return None

    ''' remove styling/javascript/scripts before parsing '''
    #TODO: fix bug www.mysite.org AND www.mysite.org/ both return
    def get_urls_from_html(self):
        if self.html is None:
            return
        cleaner = Cleaner()
        cleaner.javascript = True
        cleaner.scripts = True
        cleaner.style = True
        cleaned = html.fromstring(cleaner.clean_html(self.response.content))
        raw_urls = cleaned.xpath('//a/@href')
        #TODO: validate_urls before adding?
        return [self.urls.add(self.absolute_url(self.normalize(url))) for url in raw_urls]

    def get_title_from_html(self):
        if self.html is None:
            return None
        return self.html.findtext('.//title')

    # TODO:
    def get_text(self):
        return

#TODO:add error handling. raise ValueError or exception?
# note: this may not be needed. Invalid urls could just be represented as
# dead-end nodes
def validate_url(url):
    components = urlparse(url)
    return components.scheme and components.netloc

def get_response(url):
    return requests.get(url)
