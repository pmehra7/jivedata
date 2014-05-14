import simplejson as json
from flask import request, session, jsonify, render_template, redirect, flash
from urllib import urlencode
from jivedata.webapp import app
from jivedata.webapp.views.utils import make_api_request


def save_screen():
    screener = json.loads(request.args['screener'])
    formulas = screener['formulas']
    operators = screener['operators']
    values = screener['values']
    displayed = screener['displayed']

    if len(formulas) == len(operators) and len(formulas) == len(values):
        session['screen'] = {'formulas': formulas, 'operators': operators,
                             'values': values, 'displayed': displayed}
    return


def get_params():
    """If the user has no screen saved in their session, give them
    a default screen"""
    params = {}
    formulas = ['market_capitalization', 'cev_to_adj_ebitda',
                'cev_to_adj_ebitda', 'price_to_earnings', 'price_to_earnings']
    operators = ['ge', 'ge', 'le', 'ge', 'le']
    values = ['50000000', '0', '7', '0', '10']
    displayed = ['sector', 'industry', 'market_capitalization',
                 'cev_to_adj_ebitda', 'price_to_earnings']

    if 'screen' in session:
        formulas = session['screen']['formulas']
        operators = session['screen']['operators']
        values = session['screen']['values']
        displayed = session['screen']['displayed']

    params['formulas'] = ','.join(formulas)
    params['operators'] = ','.join(operators)
    params['values'] = ','.join(values)
    params['displayed'] = ','.join(displayed)
    return params


@app.route('/screener/', defaults={'screen_number': None})
@app.route('/screener/<screen_number>/')
def screen_view(screen_number):
    """Screener, including pre-built & custom screens"""
    if 'available_criteria' not in session:
        response = make_api_request('/screen/filters/')
        session['available_criteria'] = response['_results_']

    if 'formulas' not in session:
        f = make_api_request('/financials/formulas/')
        session['formulas'] = f['_results_']

    params = get_params()
    response = make_api_request('/screen/detail/', urlencode(params))
    params = {k: v.split(',') for k, v in params.iteritems()}

    return render_template('screener.jinja2', response=response,
                           params=params,)
