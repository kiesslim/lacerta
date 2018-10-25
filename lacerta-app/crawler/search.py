#!/usr/bin/python3.6

from flask import jsonify
import json
from parse import Web, validate_url
from queue import Queue


MAX_NODES=20

#TODO: Error handling! Depth!!
class Node:
    def __init__(self, web):
        if web is None:
            return None
        if not validate_url(web.url) or web.status_code is not 200:
            return None
        self.url = web.url
        self.edges = list(web.urls)
        self.title = web.title
        self.has_keyword = False

    def __str__(self):
        if self is None:
            return
        node_str = 'url: {}, title: {}, has_keyword: {}, edges:'.format(self.url, self.title, self.has_keyword)
        edges_str = ','.join(self.edges)
        return '{} {}'.format(node_str, edges_str)

# graph = {
#     'start_url' : start,
#     'search_type' : 'bfs',
#     'keyword' : keyword,
#     'nodes' : {
#         'url1': {
#             'url' : 'url1',
#             'title' : 'TITLE',
#             'has_keyword' : False ,
#             'edges' : ['url2','url3']
#         }
#     }
# }
class Graph:
    def __init__(self, start, depth, keyword, search_type):
        self.start_url = start
        self.depth = depth
        self.keyword = keyword
        self.search_type = search_type
        self.nodes = dict()

    def add_node(self, node):
        self.nodes[node.url]=node

'''search validates form data, and then calls appropriate search function'''
def search(start_url, max_depth, keyword, search_type):
    g = Graph(start_url, max_depth, keyword, search_type)
    if not validate_url(start_url):
        raise ValueError('Invalid Start URL: {}'.format(start_url))
    if search_type == 'BFS':
        return bfs(g, 0, max_depth)
    elif search_type == 'DFS':
        return dfs(g, 0, max_depth)
    else:
        raise ValueError('Invalid Search Type: Specify BFS or DFS')

'''Note: bfs/dfs look the same, but will be different when depth handled'''
#TODO: implement depth and keyword
def bfs(graph, current_depth, max_depth):
    start = graph.start_url
    toVisit= Queue()
    toVisit.put(start)

    # TODO: remove len(g) <100 and replace with current_depth < max_depth
    while not toVisit.empty() and len(graph.nodes) < MAX_NODES:
        current = toVisit.get()
        node = Node(Web(current))
        if node is not None:
            graph.add_node(node)
            for edge in node.edges:
                if edge not in graph.nodes:
                    toVisit.put(edge)
    print('\n\n\n\n\nPrinting Graph:\n\n\n\n\n')
    for k,v in graph.nodes.items():
        print('{}: {}\n'.format(k, v))
    return graph

'''Note: bfs/dfs look the same, but will be different when depth handled'''
#TODO: implement depth and keyword
def dfs(graph, current_depth, max_depth):
    start = graph.start_url
    #toVisit is a stack containing next nodes
    toVisit= []
    toVisit.append(start)
    print(toVisit)

    # TODO: remove len(g) <100 and replace with current_depth < max_depth
    while toVisit and len(graph.nodes) < MAX_NODES:
        current = toVisit.pop()
        node = Node(Web(current))
        if node is not None:
            graph.add_node(node)
            for edge in node.edges:
                if edge not in graph.nodes:
                    toVisit.append(edge)

    print('\n\n\n\n\nPrinting Graph:\n\n\n\n\n\n')
    for k,v in graph.nodes.items():
        print('{}: {}\n'.format(k, v))
    return graph
