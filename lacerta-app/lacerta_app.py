#!/usr/bin/python3.6

from flask import Flask, jsonify, render_template, request
from flask_s3 import FlaskS3, url_for
import sys,os
sys.path.insert(0, "{}/crawler".format(os.getcwd()))
import search


app = Flask(__name__)
app.config['FLASKS3_BUCKET_NAME'] = 'lacerta-app'
s3 = FlaskS3(app)

@app.route("/")
def hello(name=None):
	print("hi...")
	return render_template('layout.html', name=name)

@app.route("/bfs", methods=['POST'])
def bfs():
	start = request.json.get('start_url')
	depth = request.json.get('depth')
	keyword = request.json.get('keyword')
	if not start or not depth:
		return jsonify({'Error: start URL and search depth required!'}), 400
	return search.bfs(start, depth, keyword)

@app.route("/dfs", methods=['POST'])
def dfs():
	start = request.json.get('start_url')
	depth = request.json.get('depth')
	keyword = request.json.get('keyword')
	if not start or not depth:
		return jsonify({'Error: start URL and search depth required!'}), 400
	return search.dfs(start, depth, keyword)


if __name__ == '__main__':
    app.run()
