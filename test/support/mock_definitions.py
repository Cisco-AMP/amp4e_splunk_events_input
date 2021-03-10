import os
# Generates validation/input definitions as if they were created by splunk for tests
class MockDefinitions(object):
    def __init__(self, session_key=None):
        self.session_key = session_key if session_key is not None else '123456789'

    @property
    def metadata(self):
        host = os.getenv('SPLUNK_API_HOST', '127.0.0.1')
        return {'server_uri': 'https://{host}:8089/'.format(host=host), 'session_key': self.session_key,
                'name': 'amp4e_events_test_input'}
