#!/usr/bin/python3.6

from flask import jsonify
import json
import logging
from parse import Web, validate_url
from queue import Queue
import random
import requests


MAX_NODES=50

#TODO: Error handling, depth keyword
class Node:
    def __init__(self, web):
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

''' graph = {
    'start_url' : start,
    'search_type' : 'bfs',
    'depth' : depth,
    'keyword' : keyword,
    'nodes' : {
        'url1': {
            'url' : 'url1',
            'title' : 'TITLE',
            'has_keyword' : False ,
            'edges' : ['url2','url3']
        }
    }
}'''
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

    #validate url format
    if not validate_url(start_url):
        raise ValueError('Invalid Start URL: {}'.format(start_url))

    #validate url response
    r = requests.get(start_url)
    if r.status_code is not 200:
        r.raise_for_status()

    if not int(max_depth) or int(max_depth) < 0:
        raise ValueError('Error: max_depth must be a positive integer.')

    g = Graph(start_url, max_depth, keyword, search_type)
    if search_type == 'BFS':
        if int(max_depth) > 3:
            raise ValueError('Error: Invalid depth. max_depth for BFS is 3, or less')
        toVisit = []
        toVisit.append(g.start_url)
        return bfs(g, toVisit, keyword, 0, int(max_depth))
    elif search_type == 'DFS':
        if int(max_depth) > 50:
            raise ValueError('Error: Invalid depth. max_depth for DFS must be 50 or less.')
        return dfs(g,keyword, int(max_depth))
    else:
        raise ValueError('Invalid Search Type: Specify BFS or DFS')


def bfs(graph, toVisit, keyword, current_depth, max_depth):
    print('current depth = {}'.format(current_depth))
    if current_depth > max_depth:
        print('reached max depth. returning')
        return graph
    if not toVisit:
        print('toVisit empty. returning')
        return graph
    next_level = []
    for url in toVisit:
        web = Web(url)
        if web and web.status_code is 200:
            node = Node(web)
            if current_depth == max_depth:
                #strip out all edges for nodes that won't be visited
                node.edges[:] = []
            if contains_keyword(web.text, keyword):
                node.has_keyword = True
                graph.add_node(node)
                return graph
            graph.add_node(node)
            print(len(graph.nodes))
            if len(graph.nodes) >= MAX_NODES:
                print('Maximum number of nodes reached')
                return graph
            for neighbor in node.edges:
                if neighbor not in graph.nodes:
                    next_level.append(neighbor)
    return bfs(graph, next_level, keyword, current_depth+1, max_depth)


def dfs(graph, keyword, max_depth):
    start = graph.start_url
    #toVisit is a stack containing next nodes
    toVisit= []
    toVisit.append(start)

    while toVisit and len(graph.nodes) <= int(max_depth):
        current_url = toVisit.pop()
        web = Web(current_url)
        if web and web.status_code is 200:
            node = Node(web)
            if node.edges:
                random_neighbor = random.choice(node.edges)
                #remove all edges, and add randomly selected edge
                node.edges[:] = []
                node.edges.append(random_neighbor)
                if contains_keyword(web.text, keyword):
                    node.has_keyword = True
                    graph.add_node(node)
                    return graph
                graph.add_node(node)
                if random_neighbor not in graph.nodes:
                    toVisit.append(random_neighbor)
    return graph

def contains_keyword(text, keyword):
    if not text or not keyword:
        return False
    if keyword in text:
        return True
    return False

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
            'id':url[0],
            'title': url[1]['title'],
            'has_keyword': url[1]['has_keyword']
        }
        result['nodes'].append(node)
        for edge in url[1]['edges']:
            if edge in graph['nodes']:
                link = {'source': url[0], 'target': edge}
                result['links'].append(link)

    return json.dumps(result, indent=True)
