import unittest
import json
import sys
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
sys.path.insert(1, make_splunkhome_path(["etc", "apps", "amp4e_events_input", "bin"]))
import requests_mock
from util.api_service import ApiService, ApiError


class TestApiService(unittest.TestCase):
    DEFAULT_RESPONSE = '{"success": true}'
    JSON_RESPONSE = json.loads(DEFAULT_RESPONSE)
    ERROR_RESPONSE = '{"error": "Test error"}'

    def setUp(self):
        self.options = {'host': 'host', 'api_id': 'api_id', 'api_key': 'api_key'}
        self.apiService = ApiService(**self.options)

    def test_instantiation(self):
        self.assertEqual(self.apiService.host, self.options['host'])
        self.assertEqual(self.apiService.api_id, self.options['api_id'])
        self.assertEqual(self.apiService.api_key, self.options['api_key'])

    def test_index(self):
        with requests_mock.mock() as m:
            m.get('https://host/v1/event_streams/', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.index(), self.JSON_RESPONSE)

    def test_show(self):
        with requests_mock.mock() as m:
            m.get('https://host/v1/event_streams/1', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.show(1), self.JSON_RESPONSE)

    def test_create(self):
        with requests_mock.mock() as m:
            m.post('https://host/v1/event_streams/', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.create({}), self.JSON_RESPONSE)

    def test_update(self):
        with requests_mock.mock() as m:
            m.patch('https://host/v1/event_streams/1', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.update(1, {}), self.JSON_RESPONSE)

    def test_destroy(self):
        with requests_mock.mock() as m:
            m.delete('https://host/v1/event_streams/1', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.destroy(1), self.JSON_RESPONSE)

    def test_event_types(self):
        with requests_mock.mock() as m:
            m.get('https://host/v1/event_types/', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.event_types(), self.JSON_RESPONSE)

    def test_groups(self):
        with requests_mock.mock() as m:
            m.get('https://host/v1/groups/', text=self.DEFAULT_RESPONSE)
            self.assertEqual(self.apiService.groups(), self.JSON_RESPONSE)

    def test_construct_url(self):
        self.assertEqual(self.apiService._ApiService__construct_url(), 'https://host/v1/event_streams/')
        self.assertEqual(self.apiService._ApiService__construct_url(1), 'https://host/v1/event_streams/1')
        self.assertEqual(self.apiService._ApiService__construct_url('', '/v1/event_types/'),
                         'https://host/v1/event_types/')
        self.assertEqual(self.apiService._ApiService__construct_url('', '/v1/groups/'), 'https://host/v1/groups/')

    def test_error_raised(self):
        # raise error if status code is 400
        with requests_mock.mock() as m:
            m.get('https://host/v1/event_streams/', status_code=400, text=self.ERROR_RESPONSE)
            with self.assertRaises(ApiError) as api_error_context:
                self.apiService.index()
            self.assertEqual(api_error_context.exception.message, self.ERROR_RESPONSE)
            self.assertEqual(api_error_context.exception.status, 400)


class TestApiError(unittest.TestCase):
    DEFAULT_STATUS = 400
    DEFAULT_ERROR = '{"errors": "Test error"}'
    NOT_FOUND_ERROR = {
        'errors': [
            {
                'error_code': 400,
                'description': 'Bad Request',
                'details': [
                    'Event stream not found'
                ]
            }
        ]
    }
    UNKNOWN_ERROR = 'Unknown'

    def test_instantiation(self):
        self.api_error = ApiError(self.DEFAULT_ERROR, self.DEFAULT_STATUS)
        self.assertEqual(self.api_error.message, 'Test error')
        self.assertEqual(self.api_error.status, self.DEFAULT_STATUS)

    # Returns the contents of error message if it contains key 'errors'
    def test_extract_data_from_message(self):
        self.api_error = ApiError(self.DEFAULT_ERROR, self.DEFAULT_STATUS)
        self.assertEqual(self.api_error.extract_data_from_message(), 'Test error')

    # Replaces the error message if stream not found error is returned
    def test_extract_stream_not_found(self):
        self.api_error = ApiError(json.dumps(self.NOT_FOUND_ERROR), self.DEFAULT_STATUS)
        self.assertEqual(self.api_error.extract_data_from_message()[0]['details'][0], ApiError.STREAM_NOT_FOUND)

    # Returns correct error message if status is 503
    def test_extract_service_unavailable(self):
        self.api_error = ApiError(self.DEFAULT_ERROR, 503)
        self.assertEqual(self.api_error.extract_data_from_message(), self.DEFAULT_ERROR)

    # Returns text representation of error if it is not in API format
    def text_extract_unknown_error(self):
        self.api_error = ApiError(self.UNKNOWN_ERROR, 500)
        self.assertEqual(self.api_error.extract_data_from_message(), self.UNKNOWN_ERROR)
