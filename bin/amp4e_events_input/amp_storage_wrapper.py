import json
import sys
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

sys.path.insert(0, make_splunkhome_path(["etc", "apps", "amp4e_events_input", "bin", "amp4e_events_input"]))

from transient_service_factory import TransientServiceFactory


# Interacts with splunk's KV store to persist data about amp streams
class AmpStorageWrapper(object):
    COLLECTION_NAME = 'AmpEventStreams'
    DEFAULT_OWNER = 'nobody'
    DEFAULT_APP = 'amp4e_events_input'

    def __init__(self, metadata):
        self.input_name = metadata['name']
        self.service = TransientServiceFactory(metadata, self.DEFAULT_OWNER, self.DEFAULT_APP)()
        self._store = None

    @property
    def collection(self):
        try:
            if self._store is None:
                self._store = self.service.kvstore[self.COLLECTION_NAME]
            return self._store
        except KeyError:
            self.service.kvstore.create(self.COLLECTION_NAME)
            # retry
            return self.collection

    @property
    def __name_query(self):
        return {'input_name': self.input_name}

    # Searches by input name by default
    def find_stream(self, query=None):
        if query is None:
            query = self.__name_query
        try:
            return self.collection.data.query(query=json.dumps(query))[0]
        except IndexError:
            return None

    def delete_stream(self):
        self.collection.data.delete(query=json.dumps(self.__name_query))

    # finds stream by name and inserts the data if it is not found or updates it if the stream is found
    def save_stream_with_data(self, data=None):
        stream = self.find_stream()
        query = {} if data is None else data.copy()
        query['input_name'] = self.input_name
        if stream is None:
            # On create
            self.collection.data.insert(json.dumps(query))
        else:
            # On update
            self.collection.data.update(stream['_key'], json.dumps(query))
