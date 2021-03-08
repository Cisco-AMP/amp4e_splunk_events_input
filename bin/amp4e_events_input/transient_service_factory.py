try:
    from urllib.parse import urlsplit
except ImportError:
     from urlparse import urlsplit
import sys     
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from splunklib.client import Service


# Overrides splunk-sdk's Script service property in order to use service with settable owner and app
class TransientServiceFactory(object):
    def __init__(self, metadata, owner, app):
        self.owner = owner
        self.app = app
        self.metadata = metadata

    def __call__(self):
        if self.metadata is None:
            return None

        splunkd_uri = self.metadata['server_uri']
        session_key = self.metadata['session_key']

        splunkd = urlsplit(splunkd_uri, allow_fragments=False)

        self._service = Service(
            owner=self.owner,
            app=self.app,
            scheme=splunkd.scheme,
            host=splunkd.hostname,
            port=splunkd.port,
            token=session_key,
        )

        return self._service
