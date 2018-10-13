#!/usr/bin/python3.6

from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
def hello(name=None):
	print("hi...")
	return render_template('layout.html', name=name)

if __name__ == '__main__':
    app.run()
