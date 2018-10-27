#!/usr/bin/python3.6

from flask import Flask, jsonify, render_template, request
from flask_s3 import FlaskS3, url_for
from flask_dynamo import Dynamo
import sys, os, json
sys.path.insert(0, "{}/crawler".format(os.getcwd()))
import search
from parse import validate_url
import dynamo


app = Flask(__name__)
app.config['FLASKS3_BUCKET_NAME'] = 'lacerta-app'
s3 = FlaskS3(app)
# works when testing locally because no access keys included in app config
# app.config['DYNAMO_TABLES'] = [
#     {
#          'TableName':'lacerta',
#          'KeySchema':[dict(AttributeName='url', KeyType='HASH')],
#          'AttributeDefinitions':[dict(AttributeName='url', AttributeType='S')],
#          'ProvisionedThroughput':dict(ReadCapacityUnits=5, WriteCapacityUnits=5)
#     }
# ]
# db = Dynamo(app)
# with app.app_context():
#   db.create_all()

@app.route("/")
def hello(name=None):
	print("hi")
	response = dynamo.view(db)
	print(response, file=sys.stderr)
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
	#NOTE: decouple result/render
	try:
		result = search.search(start, depth, keyword, search_type)
		result_json = search.loadGraph(result)
		#NOTE: currently doesn't work because it is missing aws credentials and i don't
		#			 want to upload access keys to github where they will be scraped...
		#dynamo.add_item(db, result_json['start_url'], json.dumps(result_json))
		result_json_d3 = search.transformGraph(result_json)
		#NOTE: commented this out as we should just be returning json data, not rendering
		#return render_template('layout.html', name=name, result=result_json_d3)
		return result_json_d3, 200
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
