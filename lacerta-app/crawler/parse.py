#!/usr/bin/python3.6

from lxml import etree
from lxml import html
from lxml.html.clean import Cleaner
from random import shuffle
import requests
import sys
from urllib.parse import urldefrag, urlparse, urlsplit, urljoin

#TODO: error handling & endcoding/decoding
class Web:
    def __init__(self, url):
        print(url)
        if not validate_url(url):
            raise ValueError('Invalid  URL: URL {} is in wrong format. Try https://www.myurl.com'.format(url))
        self.url = self.normalize(url)
        self.response = get_response(url)
        self.status_code = self.response.status_code
        self.urls = set()
        self.html = self.get_html()
        self.get_urls_from_html()
        self.title = self.get_title_from_html()
        self.text = self.get_text()

    # TODO: remove query strings!!
    def normalize(self, url):
        result = urlsplit(url)
        return urldefrag(result.geturl())[0]

    def is_absolute(self, url):
        return bool(urlparse(url).netloc)

    def absolute_url(self, url):
        return urljoin(self.url, url)

    def get_html(self):
        if self.status_code is 200 and self.response.text:
            return html.fromstring(self.response.text)
        return None

    ''' remove styling/javascript/scripts before parsing '''
    #TODO: fix bug www.mysite.org AND www.mysite.org/ both return
    def get_urls_from_html(self):
        if self.html is None:
            return None
        cleaned = self.clean_html()
        raw_urls = cleaned.xpath('//a/@href')
        return shuffle([self.urls.add(self.absolute_url(self.normalize(url))) for url in raw_urls])

    def get_title_from_html(self):
        if self.html is None:
            return None
        #TODO: cleaning HTML removes the title tags, so must get title before cleaning html
        return self.html.findtext('.//title')

    #Note: get_text doesn't address broken html, i.e. although style/js removed from html,
    # it will still return .css/js when there are missing tags in the html. lxml.html.fromstring
    # is supposed to fix the broken html, but it doesn't catch everything
    def get_text(self):
        cleaned = self.clean_html()
        #print(cleaned.xpath('//text()'))
        #print(etree.XPath('//text()')(cleaned))
        return cleaned.text_content()

    def clean_html(self):
        if len(self.response.text):
            cleaner = Cleaner()
            cleaner.javascript = True
            cleaner.scripts = True
            cleaner.stye = True
            cleaner.inline_style = True
            cleaner.comments = True
            cleaner.meta = True
            cleaner.links = True
            cleaner.processing_instructions = True
            cleaner.embedded = True
            cleaner.form = True
            return html.fromstring(cleaner.clean_html(self.response.text))

#TODO:add error handling. raise ValueError or exception?
# note: this may not be needed. Invalid urls could just be represented as
# dead-end nodes
def validate_url(url):
    components = urlparse(url)
    return components.scheme and components.netloc

def get_response(url):
    return requests.get(url)
