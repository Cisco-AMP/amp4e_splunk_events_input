import os
import sys
import datetime
import json
import logging
import traceback

import requests
from splunk.clilib.info_gather import calculate_local_splunkd_protocolhostport, get_server_conf, cli_get_sessionkey
from urlparse import urlsplit
import socket

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
sys.path.insert(0, make_splunkhome_path(["lib","python3","site-packages"]))
from splunklib.client import Service
import pika as pika

SPLUNK_HOME = os.environ.get('SPLUNK_HOME', sys.prefix)
service = None
current_time = lambda: datetime.datetime.now().isoformat()


def set_service():
    global service
    splunkd_uri = calculate_local_splunkd_protocolhostport()
    token = cli_get_sessionkey(splunkd_uri)
    if token is None:
        logging.error('Please log in first by running `bin/splunk login`.')
        sys.exit(1)

    splunkd = urlsplit(splunkd_uri, allow_fragments=False)

    service = Service(
        owner='nobody',
        scheme=splunkd.scheme,
        host=splunkd.hostname,
        port=splunkd.port,
        token=token
    )
    service.login()

    return True


def setup(parser=None, callback=None, **kwargs):
    # Declare that we're going to use REST later
    callback.will_need_rest()
    set_service()


def collect_diag_info(diag, options=None, global_options=None, app_dir=None, **kwargs):
    logging.debug('Amp4e Events Input collect_diag_info() was called!')
    Collector(diag, service)()


class Collector(object):
    RELEVANT_LOG_WORD = 'amp4e'
    KVSTORE_COLLECTION_NAME = 'AmpEventStreams'
    LOGS_LOOK_BACK_LIMIT = 1
    HOSTS_TO_CHECK_CONNECTIVITY = ['export-streaming.amp.cisco.com',
                                   'export-streaming.eu.amp.cisco.com',
                                   'export-streaming.apjc.amp.cisco.com',
                                   'api.amp.cisco.com',
                                   'api.apjc.amp.cisco.com',
                                   'api.eu.amp.cisco.com']
    PORT_TO_CHECK_CONNECTIVITY = 443

    def __init__(self, diag, service):
        self.diag = diag
        self.service = service
        self.first_event_stream = self.fetch_first_stream_from_kv()
        self.api_configuration = self.fetch_api_configuration()

    def __call__(self):
        self.collect_server_info()
        self.collect_splunk_endpoints_data()
        self.collect_connectivity_data()
        self.collect_data_on_rmq_connection()
        self.collect_data_on_api_post()
        self.collect_splunk_logs()

    def collect_server_info(self):
        logging.info('Collecting server information...')
        self.diag.add_string(str(get_server_conf()), 'server_configuration.txt')

    def collect_splunk_endpoints_data(self):
        logging.info('Collecting relevant splunk REST endpoints data...')
        # The following call fetches all data about amp4e event inputs, which include API keys.
        # Please make sure you share the resulting tar file only with authorized Cisco representatives.
        self.diag.add_rest_endpoint('/servicesNS/admin/amp4e_events_input/data/inputs/amp4e_events_input',
                                    'inputs.xml')
        # The following call fetches all event streams stored in AmpEventStreams KVStore Collection,
        # that contain data used to access the RabbitMQ queues. Please make sure you share
        # the resulting tar file only with authorized Cisco representatives.
        self.diag.add_rest_endpoint('/servicesNS/nobody/amp4e_events_input/storage/collections/data/AmpEventStreams/',
                                    'kvstore.json')

    def collect_splunk_logs(self):
        logging.info('Collecting relevant splunk logs...')
        # Add app log /var/log/amp4e_events_input.log.*
        self.add_data_from_logs(os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'amp4e_events_input.log'),
                                'amp4e_events_input.log', True)
        # * /var/log/python.log | seems like app errors go into here
        self.add_data_from_logs(os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'python.log'), 'python.log')
        # * /var/log/splunkd_access.log.* | with messages containing "amp4e" - Gives us user access log
        # (like apache logs) - timing, and reponse codes
        self.add_data_from_logs(os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'splunkd_access.log'),
                                'splunkd_access.log', True, True)
        # * /var/log/splunkd_ui_access.log.* | with messages containing "amp4e", includes only requests to UI
        # with user agent info
        self.add_data_from_logs(os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'splunkd_ui_access.log'),
                                'splunkd_ui_access.log', True, True)
        # /var/log/splunkd_stderr.log.* with messages containing "amp4e" would contain HTTP errors
        self.add_data_from_logs(os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'splunkd_stderr.log'),
                                'splunkd_stderr.log', True, True)

    # Do a connectivity test using curl (or similar) to export-streaming.amp.cisco.com,
    # export-streaming.eu.amp.cisco.com, export-streaming.apjc.amp.cisco.com
    def collect_connectivity_data(self):
        logging.info('Collecting data on rmq hosts accessibility...')
        acc = map(lambda h: '{} accessible: {}'.format(h, self.is_host_accessible(h, self.PORT_TO_CHECK_CONNECTIVITY)),
                  self.HOSTS_TO_CHECK_CONNECTIVITY)
        self.diag.add_string("\n".join(acc), 'simple_connectivity.txt')

    def collect_data_on_rmq_connection(self):
        if self.first_event_stream is None:
            logging.warn('It appears you do not have any Event Streams yet. Skipping RMQ connection test.')
            return
        logging.info('Collecting data on rmq connection...')
        connection_data = self.first_event_stream.get('amqp_credentials')
        if connection_data is None:
            self.diag.add_string('First stream in KV store has no AMQP credentials', 'rmq_connection.txt')
            return
        url = "{}://{}:{}@{}:{}".format('https', connection_data['user_name'],
                                        connection_data['password'], connection_data['host'],
                                        connection_data['port'])
        try:
            connection = pika.BlockingConnection(pika.URLParameters(url))
            channel = connection.channel()
            channel.queue_declare(connection_data['queue_name'], passive=True)
            channel.basic_consume(lambda *args: None, connection_data['queue_name'])
            channel.stop_consuming()
            connection.close()
            self.diag.add_string('{} Looks OK: opened the connection, created a channel, connected to queue.'
                                 .format(current_time()), 'rmq_connection.txt')
        except Exception as e:
            self.diag.add_string('{}: {} {}'.format(e.__class__, repr(e), traceback.format_exc()), 'rmq_connection.txt')

    def collect_data_on_api_post(self):
        if self.api_configuration is None or self.api_configuration.get('api_id', '') == '':
            logging.warn('It appears, the app is not yet configured. Skipping API checking.')
            return
        logging.info('Collecting data on API Post request')
        url = 'https://{}/v1/event_streams'.format(self.api_configuration['api_host'])
        params = {'name': 'DIAG Event Stream'}
        options = {'auth': (self.api_configuration['api_id'], self.api_configuration['api_key']),
                   'verify': False, 'timeout': 300,
                   'headers': {'Accept-Language': 'da, en-gb;q=0.8, en;q=0.7', 'Content-Type': 'application/json'}}
        try:
            response = requests.post(url, data=json.dumps(params), **options)
            self.diag.add_string('{} API Response on POST request with stream without event types: ({}) {}'
                                 .format(current_time(), response.status_code, response.text), 'api_post.txt')
        except Exception as e:
            self.diag.add_string('{}: {} {}'.format(e.__class__, repr(e), traceback.format_exc()), 'api_post.txt')

    def add_data_from_logs(self, file_path, name, with_old = False, only_relevant=False):
        self.add_lines_from_log(file_path, name, only_relevant)
        if with_old:
            # add last logs
            for i in range(1, self.LOGS_LOOK_BACK_LIMIT + 1):
                old_log_path = '{}.{}'.format(file_path, i)
                if os.path.isfile(old_log_path):
                    old_log_name = '{}.{}'.format(name, i)
                    self.add_lines_from_log(old_log_path, old_log_name, only_relevant)
                else:
                    break

    def add_lines_from_log(self, file_path, name, only_relevant=False):
        if not os.path.isfile(file_path):
            self.diag.add_string('Not found: {}'.format(file_path), name)
            return
        if only_relevant:
            with open(file_path) as f:
                self.diag.add_string("\n".join([s for s in f.readlines() if self.RELEVANT_LOG_WORD in s.lower()]), name)
        else:
            self.diag.add_file(file_path, name)

    def is_host_accessible(self, host, port):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.connect((host, int(port)))
            s.shutdown(2)
            return True
        except:
            return False

    def fetch_first_stream_from_kv(self):
        try:
            return self.service.kvstore[self.KVSTORE_COLLECTION_NAME].data.query()[0]
        except (KeyError, IndexError):
            return None

    def fetch_api_configuration(self):
        try:
            return self.service.confs['inputs']['amp4e_events_input'].content
        except (KeyError, AttributeError):
            return None
