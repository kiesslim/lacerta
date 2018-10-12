#!/usr/bin/python3.6

from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    print("hi...")
    return "Hello World!"

if __name__ == '__main__':
    app.run()
