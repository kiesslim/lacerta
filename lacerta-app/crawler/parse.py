#!/usr/bin/python3.6

import logging
from lxml import etree, html
from lxml.html.clean import Cleaner
from random import shuffle
import requests
from urllib.parse import urldefrag, urlparse, urlsplit, urljoin, urlunsplit



class Web:
    """ Web object stores parses a webpage and stores relevant webpage contents.
        Web object requires web urls are in a specific format. Webpages that
        are not navigable are swallowed, i.e. an error is logged, but an exception
        is not thrown.

        attributes:
        url = webpage url and must contain scheme and netloc
        response = webpage response
        status_code =  response status code
        urls = urls parsed from html
        html = stores html object containing webpage's html
        title = stores webpage's title
        text = stores renderable webpage text
    """
    def __init__(self, url):
        print(url)
        if not validate_url_format(url):
            #TODO fix this
            return None
        self.url = self.normalize(url)
        self.response = self.get_response(url)
        self.status_code = self.get_status()
        self.urls = set()
        self.html = self.get_html()
        self.get_urls_from_html()
        self.title = self.get_title_from_html()
        self.text = self.get_text()

    def normalize(self, url):
        """
            normalizes url by removing unnecessary or redundant separators
            and also removes url fragments
        """
        result = urlunsplit(urlsplit(url))
        return urldefrag(result)[0]

    def is_absolute(self, url):
        """
            determines if a url is absolute. returns true if the url contains
            the netloc (i.e. https://www...) or false if it doesn't
        """
        return bool(urlparse(url).netloc)

    def absolute_url(self, url):
        """
            this function creates an absolute url by joining a relative url
            to the webpage's url

            keyword arguments:
            url = relative url
        """
        return urljoin(self.url, url)

    def get_html(self):
        """
            parses the html from the webpages with valid responses, or it returns
            a None object otherwise. NOTE: response.text is already encoded/decoded,
            so no additional encoding required
        """
        if self.status_code is 200 and self.response.text:
            return html.fromstring(self.response.text)
        return None

    #TODO: fix bug www.mysite.org AND www.mysite.org/ both return
    def get_urls_from_html(self):
        """
            parses all urls contained in the html. urls are stored in a set which
            eliminates redundant urls. Additionally, the set of urls is shuffled,
            i.e. randomized.
        """
        if self.html is None:
            logging.error('HTML not available cannot get URLs')
            return None
        cleaned = self.clean_html()
        raw_urls = cleaned.xpath('//a/@href')
        if not raw_urls:
            logging.error('parsing error: unable to parse urls from html')
        return shuffle([self.urls.add(self.absolute_url(self.normalize(url))) for url in raw_urls])

    def get_title_from_html(self):
        """
            Pulls the Title from the webpage's html. NOTE: the HTML was not cleaned before pulling the
            Title. This was done because cleaning the HTML removed the Title tags.
        """
        if self.html is None:
            logging.error('Cannot find title. HTML not available.')
            return None
        return self.html.findtext('.//title')

    #Note: get_text doesn't address broken html, i.e. although style/js removed from html,
    # it will still return .css/js when there are missing tags in the html. lxml.html.fromstring
    # is supposed to fix the broken html, but it doesn't catch everything
    def get_text(self):
        """
            returns all renderable text from valid webpage HTML. the html is
            cleaned prior to scraping in order to remove unnecessary information,
            however, cleaning does not completely fix all broken html. The result
            is sometimes get_text will pull style or javascript info.
        """
        if self.html is None:
            logging.error('Invalid response. HTML not available.')
            return None
        cleaned = self.clean_html()
        if cleaned is None:
            logging.error('Error cleaning HTML. Invalid object returned.')
            return None
        return cleaned.text_content()

    def clean_html(self):
        """
            Cleaner removes HTML tags prior to processing.
        """
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

    #source: https://stackoverflow.com/questions/16511337/correct-way-to-try-except-using-python-requests-module
    #source: http://flask.pocoo.org/docs/0.12/patterns/apierrors/
    #source: http://docs.python-requests.org/en/master/user/quickstart/
    def get_response(self, url):
        """
            returns the response or throws an error
        """
        try:
            response = requests.get(url)
            if response.status_code is not 200:
                logging.error('Reponse Code: {}'.format(response.status_code))
            return response
        except requests.exceptions.HTTPError as httpErr:
            logging.error('HTTP Error: {}'.format(httpErr))
        except Exception as e:
            logging.error('Server Error: {}'.format(e))

    def get_status(self):
        """
            return status code
        """
        if self.response:
            return self.response.status_code
        return 500

#TODO:add error handling. raise ValueError or exception?
# note: this may not be needed. Invalid urls could just be represented as
# dead-end nodes
def validate_url_format(url):
    components = urlparse(url)
    return components.scheme and components.netloc
