#!/usr/bin/python3.6

from flask import Flask, session, render_template, request, redirect, url_for
import json

app = Flask(__name__)
app.secret_key = b'_0fc19abebf60465c3d/'

def getJson():
  with open('testResponse.json') as data:
    return json.load(data)
  
@app.route("/")
def index(name=None):
  print("hi...")
  if 'user' in session:
    user = session['user']
    data = getJson()
    return render_template('layout.html', name=name, user=user, data=data)
  else:
    return "Please login..."


@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'POST':
    session['user'] = request.form['user']
    return redirect(url_for('index'))
  return '''
    <form method="post">
      <p><input type=text name=user>
      <p><input type=submit value=Login>
    </form>
  '''

@app.route('/logout')
def logout():
  # remove the username from the session if it's there
  session.pop('user', None)
  return redirect(url_for('index'))

if __name__ == '__main__':
  app.run()
