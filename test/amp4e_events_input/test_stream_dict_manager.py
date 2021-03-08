import unittest
import sys
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
sys.path.insert(0, make_splunkhome_path(["etc", "apps", "amp4e_events_input"]))
from bin.amp4e_events_input.stream_dict_manager import StreamDictManager


class TestStreamDictManager(unittest.TestCase):
    def setUp(self):
        self.incoming_dict = {'stream_name': 'Random name', 'groups': '1,2,3', 'event_types': '5,6,7'}
        self.dict_manager = StreamDictManager(self.incoming_dict)


class TestStreamDictManagerInstantiation(TestStreamDictManager):
    def test_instantiation(self):
        self.assertEqual(self.dict_manager.incoming_dict, self.incoming_dict)
        self.assertIsNone(self.dict_manager.result)

    def test_instantiation_with_name(self):
        self.incoming_dict['name'] = 'This should be deleted since it confuses input and stream name'
        dict_manager = StreamDictManager(self.incoming_dict)
        self.assertFalse('name' in dict_manager.incoming_dict)


class TestStreamDictManagerApi(TestStreamDictManager):
    def setUp(self):
        self.for_api_dict = {'name': 'Random name', 'group_guid': ['1', '2', '3'], 'event_type': ['5', '6', '7']}
        super(TestStreamDictManagerApi, self).setUp()

    def test_for_api(self):
        self.assertEqual(self.dict_manager.for_api(), self.for_api_dict)

    def test_for_api_no_name(self):
        self.__test_for_api_missing('stream_name', 'name')

    def test_for_api_no_groups(self):
        self.__test_for_api_missing('groups', 'group_guid')

    def test_for_api_no_event_types(self):
        self.__test_for_api_missing('event_types', 'event_type')

    def __test_for_api_missing(self, dict_key, result_key):
        del self.incoming_dict[dict_key]
        del self.for_api_dict[result_key]
        dict_manager = StreamDictManager(self.incoming_dict)
        self.assertEqual(dict_manager.for_api(), self.for_api_dict)


class TestStreamDictManagerMerge(TestStreamDictManager):
    def test_merged_with_replacement(self):
        dict_to_merge = {'stream_name': 'New name', 'groups': ''}
        expected_result = {'stream_name': 'New name', 'groups': '', 'event_types': '5,6,7'}
        self.assertEqual(self.dict_manager.merged_with(dict_to_merge), expected_result)

    def test_merged_with_ignored_fields(self):
        dict_to_merge = {'stream_name': 'New name', 'host': 'https://amp', 'stanza': 'Unknown'}
        expected_result = {'stream_name': 'New name', 'groups': '1,2,3', 'event_types': '5,6,7'}
        self.assertEqual(self.dict_manager.merged_with(dict_to_merge), expected_result)


class TestStreamDictManagerDiff(TestStreamDictManager):
    def test_diff_fields_from(self):
        diff_dict = {'stream_name': 'Random name', 'groups': '', 'event_types': '5,6,7,8'}
        expected_result = {'groups': '', 'event_types': '5,6,7,8'}
        self.assertEqual(self.dict_manager.diff_fields_from(diff_dict), expected_result)

    def test_diff_fields_from_ignored_fields(self):
        diff_dict = {'stream_name': 'Random name', 'groups': '1,2,3', 'event_types': '5,6,7', 'host': 'http://amp'}
        self.assertEqual(self.dict_manager.diff_fields_from(diff_dict), {})
