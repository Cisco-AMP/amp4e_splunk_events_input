import unittest

from splunklib.client import Service

from bin.amp4e_events_input.transient_service_factory import TransientServiceFactory
from test.support.mock_definitions import MockDefinitions


class TransientServiceFactoryTest(unittest.TestCase):
    def setUp(self):
        self.metadata = MockDefinitions().metadata
        self.app = 'amp4e_events_input_test'
        self.owner = 'nobody'
        self.factory = TransientServiceFactory(self.metadata, self.owner, self.app)

    def test_instantiation(self):
        self.assertEqual(self.factory.app, self.app)
        self.assertEqual(self.factory.owner, self.owner)
        self.assertEqual(self.factory.metadata, self.metadata)

    def test_call_service_instantiated(self):
        self.assertIsInstance(self.factory(), Service)

    def test_call_no_definitions(self):
        factory = TransientServiceFactory(None, self.owner, self.app)
        self.assertIsNone(factory())
