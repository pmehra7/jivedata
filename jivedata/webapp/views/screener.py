import simplejson as json
from flask import request, session, render_template, flash
from jivedata.webapp import app
from jivedata.webapp.views.utils import make_api_request
from user import make_user_request


def update_screen():
    time_periods = {'1 Quarter Ago': 'one_quarter_ago',
                    '1 Year Ago': 'one_year_ago',
                    '5 Years Ago': 'five_years_ago'}
    screen = json.loads(request.args['screener'])
    save = screen['save']
    del screen['save']

    for key, values in screen.iteritems():
        if key == 'values':
            #  convert '1 Year Ago' to 'ebitda_one_year_ago'
            for i, value in enumerate(values):
                if value in time_periods.keys():
                    screen[key][i] = screen['formulas'][i] + '_' + \
                                     time_periods[value]
            screen[key] = values

    for key, values in screen.iteritems():
        if key != 'id':
            screen[key] = ','.join(values)

    if save == 'reset':
        session['screen'] = default_screen()
    elif save == False:  # run a pre-saved screen
        try:
            session['screen'] = [x for x in session['screens'] if
                              x['id'] == screen['id']][0]
        except (IndexError, KeyError):
            session['screen'] = screen
    elif save == True:  # save a screen
        screens = [x for x in session['screens'] if
                              x['id'] != screen['id']]

        screens.append(screen)
        params = {'screens': json.dumps(screens)}
        params['action'] = 'replace'
        params['item'] = 'screens'

        response = make_user_request('/user/update/', data=params)
        response = response.json()
        session['screens'] = response['_results_']['screens']
        session['screen'] = screen
    return


def default_screen():
    screen = {}
    screen['id'] = ''
    screen['formulas'] = ('market_capitalization,cev_to_adj_ebitda,'
                          'cev_to_adj_ebitda,price_to_earnings,'
                          'price_to_earnings')
    screen['operators'] = 'ge,ge,le,ge,le'
    screen['values'] = '50000000,0,7,0,10'
    screen['displayed'] = ('market_capitalization,cev,cev_to_adj_ebitda,'
                            'price_to_earnings')
    return screen


def get_params():
    """If the user has no screen saved in their session, give them
    a default screen"""
    params = default_screen()

    if 'screen' in session:
        params = session['screen']
    else:
        if 'screens' in session:
            params = session['screens'][0]
        session['screen'] = params
    return params


@app.route('/screener/')
def screen_view():
    """Screener, including pre-built & custom screens"""
    groups = ['formulas', 'margins', 'ratios', 'multiples', 'quotes']

    f = make_api_request('/financials/formulas/')
    formulas = f['_results_']
    sorted_formulas = []
    for k, v in formulas.iteritems():
        if k in groups:
            sorted_formulas += v
    sorted_formulas = sorted(sorted_formulas)

    params = get_params()
    response = make_api_request('/screen/detail/', params)
    params = {k: v.split(',') for k, v in params.iteritems()}
    if 'user_oauth_token' not in session or \
            'access_token' not in session['user_oauth_token']:
        flash('Login to save screens', 'info')

    return render_template('screener.jinja2', response=response,
                           params=params, groups=groups, formulas=formulas,
                           sorted_formulas=sorted_formulas)
