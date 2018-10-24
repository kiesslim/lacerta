#!/usr/bin/python3.6

from flask import Flask, jsonify, render_template, request
from flask_s3 import FlaskS3, url_for
import sys, os
from os import path
sys.path.insert(0, "{}/crawler".format(os.getcwd()))
import search

app = Flask(__name__)
app.config['FLASKS3_BUCKET_NAME'] = 'lacerta-app2'
s3 = FlaskS3(app)

@app.route("/")
def hello(name=None):
	return render_template('layout.html', name=name)

@app.route("/query", methods=['POST'])
def query(name=None):
	start = request.form["start_url"]
	depth = request.form["depth"]
	keyword = request.form["keyword"]
	search_type = request.form["search_type"]
	if not start or not depth:
	 	return jsonify({'Error: start URL and search depth required!'}), 400
	if search_type == "BFS":
		result = search.bfs(start, depth, keyword)
	elif search_type == "DFS":
		result = search.dfs(start, depth, keyword)
	return render_template('layout.html', name=name, result=result)

# @app.route("/dfs", methods=['POST'])
# def dfs():
# 	start = request.json.get('start_url')
# 	depth = request.json.get('depth')
# 	keyword = request.json.get('keyword')
# 	if not start or not depth:
# 		return jsonify({'Error: start URL and search depth required!'}), 400
# 	return search.dfs(start, depth, keyword)

if __name__ == '__main__':
    app.run()
