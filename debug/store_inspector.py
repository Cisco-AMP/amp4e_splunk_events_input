import json


from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from splunklib.client import Service

class StoreInspector(object):
    def __init__(self, host='localhost', port='8089', scheme='https', username='admin', password='password'):
        self._service = Service(owner='nobody', app='amp4e_events_input', scheme=scheme, host=host, port=port,
                                username=username, password=password)
        # self._service = Service(owner='nobody', app='amp4e_events_input', scheme='https', host='localhost', port='8089',
        #                         username='admin', password='welcome')
        self._service.login()
        self.collection = self._service.kvstore['AmpEventStreams']

    def list_collections(self):
        for collection in self._service.kvstore:
            print "  {}".format(collection.name)

    def list_records_within_amp_collection(self, query=None):
        if query is None:
            query = {}
        print json.dumps(self.collection.data.query(query=json.dumps(query)), indent=1)
