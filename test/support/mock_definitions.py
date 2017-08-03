# Generates validation/input definitions as if they were created by splunk for tests
class MockDefinitions(object):
    def __init__(self, session_key=None):
        self.session_key = session_key if session_key is not None else '123456789'

    @property
    def metadata(self):
        return {'server_uri': 'http://127.0.0.1:8089/', 'session_key': self.session_key,
                'name': 'amp4e_events_test_input'}
