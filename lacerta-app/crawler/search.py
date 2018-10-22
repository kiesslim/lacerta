#!/usr/bin/python3.6

from flask import jsonify
import parse
import json


class Node:
    def __init__(self, url, title):
        self.url = url
        self.edges = []
        self.title = title
        self.has_keyword = False

class Graph:
    def __init__(self, start, depth, keyword, search_type):
        self.start_url = start
        self.depth = depth
        self.keyword = keyword
        self.search_type = search_type
        self.nodes = dict()

    def add_node(node):
        if node.url in self.nodes:
            #TODO: error handling
            return
        self.nodes[node.url]=node

#toVisit = Queue
def bfs(start, depth, keyword):
    graph = {
        'start_url' : start,
        'search_type' : 'bfs',
        'keyword' : keyword,
        'nodes' : {
            'url1': {
                'url' : 'url1',
                'title' : 'TITLE',
                'has_keyword' : False ,
                'edges' : ['url2','url3']
            }
        }
    }
    # start = Web(start_url)
    # toVisit= Queue()
    # visited = set()
    # toVisit.put(start)
    #
    # while not toVisit.is_empty():
    #     current = toVisit.get()
        #add all neighbors to toVisit if it doesnt contain it
    return json.dumps(graph, indent=True)

#toVisit = stack
def dfs(start, depth, keyword):
    graph = {
        'start_url' : start,
        'search_type' : 'bfs',
        'keyword' : keyword,
        'nodes' : {
            'url1': {
                'url' : 'url1',
                'title' : 'TITLE',
                'has_keyword' : False ,
                'edges' : ['url2','url3']
            }
        }
    }
    return json.dumps(graph, indent=True)
