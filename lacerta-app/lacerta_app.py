#!/usr/bin/python3.6

from flask import Flask, jsonify, render_template, request
from flask_s3 import FlaskS3, url_for
import sys, os
from os import path
sys.path.insert(0, "{}/crawler".format(os.getcwd()))
import search
from parse import validate_url

app = Flask(__name__)
app.config['FLASKS3_BUCKET_NAME'] = 'lacerta-app'
s3 = FlaskS3(app)

@app.route("/")
def hello(name=None):
	print("hi")
	return render_template('layout.html', name=name)

@app.route("/query", methods=['POST'])
def query(name=None):
	print(request.form)
	start = request.form["start_url"]
	depth = request.form["depth"]
	keyword = request.form["keyword"]
	search_type = request.form["search_type"]
	print(search_type)

	if not validate_url(start):
		return bad_request('Error: Invalid Start URL: {}'.format(start))
	if not start or not depth:
	 	return bad_request('Error: Start URL and seach depth required!')
	if search_type not in ['BFS', 'DFS']:
	 	return bad_request('Error: search type {} is an invalid search type'.format(search_type))
	try:
		result = search.search(start, depth, keyword, search_type)
    result_json = search.loadGraph(result)
	  result_json_d3 = search.transformGraph(result_json)
	  return render_template('layout.html', name=name, result=result_json_d3)
		return render_template('layout.html', name=name, result=result)
	except ValueError as error:
		return bad_request(str(error))

#TODO: add additional errorhandlers
@app.errorhandler(400)
def bad_request(error_message):
	message = {
		'status' : 400,
		'message' : str(error_message)
	}
	response = jsonify(message)
	response.status_code = 400
	return response

if __name__ == '__main__':
    app.run()
