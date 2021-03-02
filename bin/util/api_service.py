import json

import requests
import traceback

import os
import sys

from amp4e_events_input.stream_dict_manager import StreamDictManager
from splunk.clilib import cli_common as cli
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

sys.path.insert(0, make_splunkhome_path(["etc", "apps", "amp4e_events_input", "bin", "util"]))
from logger import logger


class ApiService(object):
    PROTO = 'https'
    STREAMS_ENDPOINT = '/v1/event_streams/'
    EVENT_TYPES_ENDPOINT = '/v1/event_types/'
    GROUPS_ENDPOINT = '/v1/groups/'
    HEADERS = {'Accept-Language': 'da, en-gb;q=0.8, en;q=0.7'}
    JSON_HEADERS = {'Content-Type': 'application/json'}
    REQUEST_TIMEOUT = 300
    SSL_CERT_FILE = os.path.join(os.environ.get('SPLUNK_HOME'), 'etc', 'apps', 'amp4e_events_input', 'certs', 'amp_cisco.crt')

    def __init__(self, host, api_id, api_key):
        self.host = host
        self.api_id = api_id
        self.api_key = api_key

    def with_validated_response(func):
        def wrapper(*args, **kwargs):
            try:
                response = func(*args, **kwargs)
                logger.info('Received response from ApiService ({})'.format(response.status_code))
                status = response.status_code
                if status in range(200, 399):
                    if len(response.text) > 0:
                        return response.json()
                else:
                    raise ApiError(response.text, response.status_code)
            except requests.exceptions.RequestException as e:
                logger.error(traceback.format_exc())
                logger.error(repr(e))
                raise ApiError('Request failure: {}'.format(e.__class__, repr(e)), 502)

        return wrapper

    @with_validated_response
    def index(self):
        return requests.get(self.__construct_url(), **self.__shared_options())

    @with_validated_response
    def show(self, stream_id):
        return requests.get(self.__construct_url(stream_id), **self.__shared_options())

    @with_validated_response
    def create(self, params):
        params = StreamDictManager(params).for_api()
        logger.info('ApiService - creating stream with params {}'.format(params))
        return requests.post(self.__construct_url(), data=json.dumps(params), **self.__shared_options(True))

    @with_validated_response
    def update(self, stream_id, params):
        params = StreamDictManager(params).for_api()
        return requests.patch(self.__construct_url(stream_id), data=json.dumps(params), **self.__shared_options(True))

    @with_validated_response
    def destroy(self, stream_id):
        return requests.delete(self.__construct_url(stream_id), **self.__shared_options())

    @with_validated_response
    def event_types(self):
        return requests.get(self.__construct_url('', self.EVENT_TYPES_ENDPOINT), **self.__shared_options())

    @with_validated_response
    def groups(self):
        return requests.get(self.__construct_url('', self.GROUPS_ENDPOINT), **self.__shared_options())

    def __construct_url(self, ending='', endpoint=STREAMS_ENDPOINT):
        return '{}://{}{}{}'.format(self.PROTO, self.host, endpoint, ending)

    def __shared_options(self, add_json_headers=False):
        options = {
            'auth': (self.api_id, self.api_key),
            'timeout': self.REQUEST_TIMEOUT,
            'verify': self.__ssl_options(),
            'proxies': self.__proxy_options()
        }
        headers = self.HEADERS.copy()
        if add_json_headers:
            headers.update(self.JSON_HEADERS)
        options['headers'] = headers
        return options

    def __proxy_options(self):
        stanza = self.__get_self_conf_stanza('server.conf', 'proxyConfig')
        return {
            'http': stanza.get('http_proxy', os.environ.get('HTTP_PROXY')),
            'https': stanza.get('https_proxy', os.environ.get('HTTPS_PROXY'))
        }

    def __ssl_options(self):
        return os.environ.get('AMP_SSL_CERT_FILE', self.SSL_CERT_FILE)

    def __get_self_conf_stanza(self, conf_name, stanza):
        appdir = os.path.join(sys.prefix, 'etc', 'system')
        apikeyconfpath = os.path.join(appdir, 'default', conf_name)
        apikeyconf = cli.readConfFile(apikeyconfpath)
        localconfpath = os.path.join(appdir, 'local', conf_name)
        if os.path.exists(localconfpath):
            localconf = cli.readConfFile(localconfpath)
            for name, content in localconf.items():
                if name in apikeyconf:
                    apikeyconf[name].update(content)
                else:
                    apikeyconf[name] = content
        return apikeyconf.get(stanza, {})

class ApiError(Exception):
    SERVICE_UNAVAILABLE_ERRORS = {
        'errors': [
            {
                'error_code': 503,
                'description': 'Service Unavailable',
                'details': [
                    'API host could not be reached. Please make sure your API host configuration option is correct ' \
                    'and try again later.'
                ]
            }
        ]
    }
    ENDPOINT_NOT_FOUND_ERRORS = {
        'errors': [
            {
                'error_code': 404,
                'description': 'Not found',
                'details': [
                    'One of AMP for Endpoints API endpoints could not be reached (status 404). Please contact your Cisco AMP for Endpoints ' \
                    'Administrator to resolve this issue.'
                ]
            }
        ]
    }
    STREAM_NOT_FOUND = 'Looks like the stream you requested does not exist at API server. This might have ' \
                       'happened because the stream has been deleted directly through API. Please contact support.'

    def __init__(self, message, status):
        logger.error('API Error (status {}): {}'.format(status, message))
        self.status = status
        self.stream_is_not_found = False
        self.message = message
        self.__set_message()

    def __str__(self):
        return "API Error (status {}): {}".format(self.status, self.extract_data_from_message())

    def extract_data_from_message(self):
        return self.message

    def __set_message(self):
        try:
            if self.status in range(502, 505):
                return
            elif self.status == 404:
                message = self.ENDPOINT_NOT_FOUND_ERRORS
                self.message = message['errors']
            else:
                message = json.loads(self.message)
                try:
                    if isinstance(message['errors'], list) and \
                                    'event stream not found' in message['errors'][0]['details'][0].lower():
                        message['errors'][0]['details'] = [self.STREAM_NOT_FOUND]
                        self.stream_is_not_found = True
                    self.message = message['errors']
                except (AttributeError, IndexError, KeyError):
                    pass
        except (ValueError, KeyError):
            pass
