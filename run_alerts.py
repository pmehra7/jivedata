from jivedata.alerts import Alerts
from jivedata.utils import Client


CLIENT_ID = ''
CLIENT_SECRET = ''
SUBSCRIBED_ALERTS = ['/filings/', '/insiders/', '/13F/', '/econ/']


def get_resources():
    endpoints = SUBSCRIBED_ALERTS
    params = {'/filings/': {'insiders': 'false'}}

    alerts = Alerts(client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            endpoints=endpoints, params=params)

    alerts.add_html()
    return alerts


def emailer(alerts):
    c = Client(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
    c.get_protected(endpoint='/user/detail/')

    watchlist = c.results['_results_']['watchlist']
    funds = c.results['_results_']['funds']

    watchlist_ciks = ','.join([str(x['cik']) for x in watchlist])
    funds_ciks = ','.join([str(x['cik']) for x in funds])

    alerts.watchlist_filter(watchlist=watchlist_ciks, funds=funds_ciks,
                            subscribed_alerts=SUBSCRIBED_ALERTS)

    for alert in alerts.email_alerts:
        """Handle email alerts"""
        print alert


def tweeter(alerts):
    alerts.create_twitter_alerts()
    print alerts.twitter_alerts
    for alert in alerts.twitter_alerts:
        """Handle twitter updates"""
        print alert


if __name__ == '__main__':
    alerts = get_resources()
    emailer(alerts)
    tweeter(alerts)
