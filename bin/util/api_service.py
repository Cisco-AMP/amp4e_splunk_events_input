import json

import requests

from amp4e_events_input.stream_dict_manager import StreamDictManager


class ApiService(object):
    PROTO = 'https'
    STREAMS_ENDPOINT = '/v1/event_streams/'
    EVENT_TYPES_ENDPOINT = '/v1/event_types/'
    GROUPS_ENDPOINT = '/v1/groups/'
    VERIFY_SSL = False
    JSON_HEADERS = {'Content-Type': 'application/json'}

    def __init__(self, host, api_id, api_key):
        self.host = host
        self.api_id = api_id
        self.api_key = api_key

    def with_validated_response(func):
        def wrapper(*args, **kwargs):
            response = func(*args, **kwargs)
            status = response.status_code
            if status in range(200, 399):
                if len(response.text) > 0:
                    return response.json()
            else:
                raise ApiError(response.text, response.status_code)

        return wrapper

    @with_validated_response
    def index(self):
        return requests.get(self.__construct_url(), auth=(self.api_id, self.api_key), verify=self.VERIFY_SSL)

    @with_validated_response
    def show(self, stream_id):
        return requests.get(self.__construct_url(stream_id), auth=(self.api_id, self.api_key), verify=self.VERIFY_SSL)

    @with_validated_response
    def create(self, params):
        params = StreamDictManager(params).for_api()
        return requests.post(self.__construct_url(), auth=(self.api_id, self.api_key), data=json.dumps(params),
                             headers=self.JSON_HEADERS, verify=self.VERIFY_SSL)

    @with_validated_response
    def update(self, stream_id, params):
        params = StreamDictManager(params).for_api()
        return requests.patch(self.__construct_url(stream_id), auth=(self.api_id, self.api_key),
                              data=json.dumps(params), headers=self.JSON_HEADERS, verify=self.VERIFY_SSL)

    @with_validated_response
    def destroy(self, stream_id):
        return requests.delete(self.__construct_url(stream_id), auth=(self.api_id, self.api_key),
                               verify=self.VERIFY_SSL)

    @with_validated_response
    def event_types(self):
        return requests.get(self.__construct_url('', self.EVENT_TYPES_ENDPOINT), auth=(self.api_id, self.api_key),
                            verify=self.VERIFY_SSL)

    @with_validated_response
    def groups(self):
        return requests.get(self.__construct_url('', self.GROUPS_ENDPOINT), auth=(self.api_id, self.api_key),
                            verify=self.VERIFY_SSL)

    def __construct_url(self, ending = '', endpoint = STREAMS_ENDPOINT):
        return '{}://{}{}{}'.format(self.PROTO, self.host, endpoint, ending)

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
                    'One of AMP API endpoints could not be reached (status 404). Please contact your Cisco AMP '
                    'Administrator to resolve this issue.'
                ]
            }
        ]
    }
    STREAM_NOT_FOUND = 'Looks like the stream you requested does not exist at API server. This might have ' \
                       'happened because the stream has been deleted directly through API. Please contact the support.'

    def __init__(self, message, status):
        super(ApiError, self).__init__(message)
        self.status = status
        self.stream_is_not_found = False
        self.__set_message()

    def __str__(self):
        return "API Error (status {}): {}".format(self.status, self.extract_data_from_message())

    def extract_data_from_message(self):
        return self.message

    def __set_message(self):
        try:
            if self.status == 503:
                message = self.SERVICE_UNAVAILABLE_ERRORS
            elif self.status == 404:
                message = self.ENDPOINT_NOT_FOUND_ERRORS
            else:
                message = json.loads(self.message)
                try:
                    if isinstance(message['errors'], list) and \
                                    'event stream not found' in message['errors'][0]['details'][0].lower():
                        message['errors'][0]['details'] = [self.STREAM_NOT_FOUND]
                        self.stream_is_not_found = True
                except (AttributeError, IndexError, KeyError):
                    pass
            self.message = message['errors']
        except (ValueError, KeyError):
            pass
