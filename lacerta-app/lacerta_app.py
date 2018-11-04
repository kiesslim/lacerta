#!/usr/bin/python3.6

from flask import Flask, jsonify, render_template, request, session
from flask_s3 import FlaskS3, url_for
from os import path
from flask_dynamo import Dynamo
import sys, os, json, uuid
sys.path.insert(0, "{}/crawler".format(os.getcwd()))
import search
from parse import validate_url
import traceback
import dynamo


app = Flask(__name__)
text_file = open('session_credential.txt', 'r')
secret_key_string = text_file.read()
secret_key_bytes = bytes(secret_key_string, 'utf-8')
app.secret_key = secret_key_bytes
text_file.close()
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

def getCookieData():
	with open('test_log.json') as data:
		return json.load(data)

@app.route("/")
def hello(name=None):
	print("hi")
	if 'user' in session:
		user = session['user']
		data = getCookieData()
	else:
		session['user'] = uuid.uuid4()
		user = session['user']
		data = None
	#response = dynamo.view(db)
	#print(response, file=sys.stderr)
	return render_template('layout.html', name=name, data=data)

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
	if not int(depth) or int(depth) < 0:
		return bad_request('Error: Invalid depth. Please specify a positive integer')
	#NOTE: decouple result/render
	try:
		result = search.search(start, depth, keyword, search_type)
		result_json = search.loadGraph(result)
		#NOTE: currently doesn't work because it is missing aws credentials and i don't
		#			 want to upload access keys to github where they will be scraped...
		#dynamo.add_item(db, result_json['start_url'], json.dumps(result_json))
		result_json_d3 = search.transformGraph(result_json)
		return result_json_d3, 200
	except ValueError as error:
		tb = traceback.format_exc()
		print(tb)
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
