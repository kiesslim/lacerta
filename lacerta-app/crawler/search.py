#!/usr/bin/python3.6

from flask import jsonify
import parse
import json


#toVisit = Queue
def bfs(start, depth, keyword):
    links = ['link1','link2']
    graph = { 'id' : 'node_url', 'node' : {'url' : 'URL', 'title' : 'TITLE', 'has_keyword' : False}, 'edges' : links }
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
    links = ['link1','link2']
    graph = { 'id' : 'node_url', 'node' : {'url' : 'URL', 'title' : 'TITLE', 'has_keyword' : False}, 'edges' : links }
    return json.dumps(graph, indent=True)

def add_Node(graph, web):
    graph[web.url] = { 'title' : web.title, 'url' : web.url, 'links' : web.urls }
    return graph
