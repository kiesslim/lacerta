#!/usr/bin/python3.6

from flask import Flask
from flask_s3 import FlaskS3, url_for
from flask import render_template


app = Flask(__name__)
app.config['FLASKS3_BUCKET_NAME'] = 'lacerta-app'
s3 = FlaskS3(app)

@app.route("/")
def hello(name=None):
	print("hi...")
	print(s3)
	print(url_for('static', filename='test.html'))
	#print(url_for)
	#print(app.jinja_env.globals)
	#app.jinja_env.globals.update(url_for=url_for)
	#print(app.jinja_env.globals)
	#print(app.jinja_env.globals['url_for']('static', filename='test3.html'))
	return render_template('layout.html', name=name)

if __name__ == '__main__':
    app.run()
