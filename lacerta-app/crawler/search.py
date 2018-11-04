#!/usr/bin/python3.6

from flask import jsonify
import json
from parse import Web, validate_url
from queue import Queue
import random


MAX_NODES=20

#TODO: Error handling, depth keyword
class Node:
    def __init__(self, web, keyword):
        self.url = web.url
        self.edges = list(web.urls)
        self.title = web.title
        self.has_keyword = self.contains_keyword(web, keyword)

    def contains_keyword(self, web, keyword):
        if keyword and keyword in web.text:
            return True
        return False

    def __str__(self):
        if self is None:
            return
        node_str = 'url: {}, title: {}, has_keyword: {}, edges:'.format(self.url, self.title, self.has_keyword)
        edges_str = ','.join(self.edges)
        return '{} {}'.format(node_str, edges_str)

# graph = {
#     'start_url' : start,
#     'search_type' : 'bfs',
#     'depth' : depth,
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
    #validate depth
    g = Graph(start_url, max_depth, keyword, search_type)
    if not validate_url(start_url):
        raise ValueError('Invalid Start URL: {}'.format(start_url))
    if not int(max_depth) or int(max_depth) < 0:
        raise ValueError('Error: max_depth must be an integer and >0.')

    g = Graph(start_url, max_depth, keyword, search_type)
    if search_type == 'BFS':
        if int(max_depth) > 3:
            raise ValueError('Error: Invalid depth. max_depth for BFS is 3, or less')
        return bfs(g, keyword, 0, max_depth)
    elif search_type == 'DFS':
        if int(max_depth) > 50:
            raise ValueError('Error: Invalid depth. max_depth for DFS must be 50 or less.')
        return dfs(g, keyword, max_depth)
    else:
        raise ValueError('Invalid Search Type: Specify BFS or DFS')

'''Note: bfs/dfs look the same, but will be different when depth handled'''
#TODO: implement depth... recursive?!
def bfs(graph, keyword, current_depth, max_depth):
    start = graph.start_url
    toVisit= Queue()
    toVisit.put(start)
    #TODO: find better solution!
    start_node = Node(Web(start), keyword)

    while not toVisit.empty() and len(graph.nodes) <= len(start_node.edges):
        current = toVisit.get()
        current_web = Web(current)
        if current_web.status_code is 200:
            node = Node(current_web, keyword)
            graph.add_node(node)
            if node.has_keyword:
                break
            for edge in node.edges:
                if edge not in graph.nodes:
                    toVisit.put(edge)
    return graph

def dfs(graph, keyword, max_depth):
    start = graph.start_url
    #toVisit is a stack containing next nodes
    toVisit= []
    toVisit.append(start)

    while toVisit and len(graph.nodes) <= int(max_depth):
        current = toVisit.pop()
        current_web = Web(current)
        if current_web.status_code is 200:
            node = Node(current_web, keyword)
            if node.edges:
                random_edge = random.choice(node.edges)
                #remove all edges, and add randomly selected edge
                node.edges[:] = []
                node.edges.append(random_edge)
                graph.add_node(node)
                if node.has_keyword:
                    break
                if random_edge not in graph.nodes:
                    toVisit.append(random_edge)
    return graph

'''loads node object to json format'''
def loadNode(n):
    result = {
        'url': n.url,
        'title': n.title,
        'has_keyword': n.has_keyword,
        'edges': list(n.edges)
    }
    return result

'''loads graph object to json format'''
def loadGraph(g):
    result = {
        'start_url' : g.start_url,
        'search_type' : g.search_type,
        'depth' : g.depth,
        'keyword' : g.keyword,
        'nodes' : dict()
    }
    for k,v in g.nodes.items():
        result['nodes'][k] = loadNode(v)
    return result

'''converts search graph format to d3 accepted data format'''
def transformGraph(graph):
    result = {
        'start_url': graph['start_url'],
        'keyword': graph['keyword'],
        'depth': graph['depth'],
        'type': graph['search_type'],
        'links': list(),
        'nodes': list()
    }

    for url in graph['nodes'].items():
        node = {
            'title': url[1]['title'],
            'url':url[0],
            'has_keyword': url[1]['has_keyword']
        }
        result['nodes'].append(node)
        for edge in url[1]['edges']:
            if edge in graph['nodes']:
                link = {'source': url[0], 'target': edge}
                result['links'].append(link)

    return json.dumps(result, indent=True)
