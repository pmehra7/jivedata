import os
from flask import redirect
from jivedata.webapp import app, jinja2_filters
from jivedata.webapp.views import (financials, econ, filings, insiders,
                                   institutional, utils, user)

app.config.update(
    test_data=True,
    client_id='',
    client_secret='',
    secondary_client_id='',
    secondary_client_secret='',
    redirect_uri='http://127.0.0.1:5000/authorized/',
)


@app.route('/')
def home():
    return redirect('/financials/')


if __name__ == '__main__':
    app.secret_key = 'super_secret'
    os.environ['DEBUG'] = '1'
    app.run(debug=True, use_reloader=True, use_debugger=True)
