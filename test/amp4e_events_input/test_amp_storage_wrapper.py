import unittest
import json

from splunklib.client import Service, KVStoreCollection

from bin.amp4e_events_input.amp_storage_wrapper import AmpStorageWrapper
from test.support.mock_definitions import MockDefinitions
from test.support.config import SPLUNK_AUTH_OPTIONS


class TestWrapperWithoutConnection(unittest.TestCase):
    def setUp(self):
        self.metadata = MockDefinitions().metadata
        self.storage_wrapper = AmpStorageWrapper(self.metadata)

    def test_instantiation(self):
        self.assertEqual(self.storage_wrapper.input_name, self.metadata['name'])
        self.assertIsNone(self.storage_wrapper._store)
        self.assertIsInstance(self.storage_wrapper.service, Service)

    def test_name_query_property(self):
        self.assertEqual(self.storage_wrapper._AmpStorageWrapper__name_query,
                         {'input_name': self.metadata['name']})


class TestWrapperWithConnection(unittest.TestCase):
    COLLECTION_NAME = 'TestAmpEventStreams'

    def setUp(self):
        AmpStorageWrapper.COLLECTION_NAME = self.COLLECTION_NAME
        self.service = Service(owner='nobody', app='amp4e_events_input', scheme=SPLUNK_AUTH_OPTIONS['scheme'],
                               host=SPLUNK_AUTH_OPTIONS['host'], port=SPLUNK_AUTH_OPTIONS['port'],
                               username=SPLUNK_AUTH_OPTIONS['username'], password=SPLUNK_AUTH_OPTIONS['password'])
        self.service.login()
        self.service.kvstore.create(self.COLLECTION_NAME)
        self.metadata = MockDefinitions(self.service.token).metadata
        self.stream_representation = {'input_name': self.metadata['name']}
        self.storage = AmpStorageWrapper(self.metadata)

    def tearDown(self):
        self.service.kvstore.delete(self.COLLECTION_NAME)

    def test_collection(self):
        self.assertIsInstance(self.storage.collection, KVStoreCollection)
        self.assertIn(self.COLLECTION_NAME, [x.name for x in self.service.kvstore])

    def test_find_stream(self):
        self.__create_stream()
        self.assertEqual(self.storage.find_stream()['input_name'], self.stream_representation['input_name'])

    # returns None if stream cannot be found
    def test_find_stream_none(self):
        self.assertIsNone(self.storage.find_stream())

    def test_find_stream_other_query(self):
        new_data = {'custom_field': '1234'}
        new_representation = self.stream_representation.copy()
        new_representation.update(new_data)
        self.__create_stream(new_representation)
        found_stream = self.storage.find_stream(new_data)
        self.assertEqual(found_stream['input_name'], self.stream_representation['input_name'])
        self.assertEqual(found_stream['custom_field'], new_data['custom_field'])

    def test_delete_stream(self):
        self.__create_stream()
        self.storage.delete_stream()
        self.assertEqual(self.service.kvstore[self.COLLECTION_NAME].data
                         .query(query=json.dumps(self.stream_representation)), [])

    # does not raise error if stream does not exist
    def test_delete_stream_none(self):
        self.storage.delete_stream()

    def test_save_stream_with_data_create(self):
        additional_data = {'test_key': 'test_value'}
        self.assertEqual(self.service.kvstore[self.COLLECTION_NAME]
                         .data.query(query=json.dumps(self.stream_representation)), [])
        self.storage.save_stream_with_data(additional_data)
        streams = self.service.kvstore[self.COLLECTION_NAME].data.query(query=json.dumps(self.stream_representation))
        self.assertEqual(len(streams), 1)
        stream = streams[0]
        self.assertEqual(stream['input_name'], self.stream_representation['input_name'])
        self.assertEqual(stream['test_key'], additional_data['test_key'])

    def test_save_stream_with_data_update(self):
        self.__create_stream()
        self.assertEqual(len(self.service.kvstore[self.COLLECTION_NAME]
                             .data.query(query=json.dumps(self.stream_representation))), 1)
        additional_data = {'test_key': 'test_value'}
        self.storage.save_stream_with_data(additional_data)
        streams = self.service.kvstore[self.COLLECTION_NAME].data.query(query=json.dumps(self.stream_representation))
        self.assertEqual(len(streams), 1)
        stream = streams[0]
        self.assertEqual(stream['input_name'], self.stream_representation['input_name'])
        self.assertEqual(stream['test_key'], additional_data['test_key'])

    def __create_stream(self, query=None):
        query = query if query is not None else self.stream_representation
        self.service.kvstore[self.COLLECTION_NAME].data.insert(json.dumps(query))
