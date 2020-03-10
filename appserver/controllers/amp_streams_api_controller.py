import sys
import cherrypy
import traceback
from functools import wraps

from splunk.appserver.mrsparkle.lib import jsonresponse
from splunk.appserver.mrsparkle.lib.decorators import expose_page
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

sys.path.insert(0, make_splunkhome_path(["etc", "apps", "amp4e_events_input", "bin"]))

from util.api_service import ApiService, ApiError
from util.logger import logger
from amp4e_events_input.amp_storage_wrapper import AmpStorageWrapper
from amp4e_events_input.stream_dict_manager import StreamDictManager
import splunklib.client as client

# When the controller has any kind of runtime error - Splunk will simply ignore it, returning 404.
# Make sure you have no runtime errors before trying to reach this controller from Splunk Web
class AmpStreamsApiController(controllers.BaseController):
    def jsonify_errors(func):
        @wraps(func)
        def wrapper(inst, *args, **kwargs):
            try:
                return func(inst, *args, **kwargs)
            except ApiError as e:
                return inst.__json_error(e.extract_data_from_message())
            except Exception as e:
                return inst.__json_error({'error': str(e), 'trace': traceback.format_exc()})

        return wrapper

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET'])
    def event_streams_list(self, **kwargs):
        amp_api = ApiService(kwargs['api_host'], kwargs['api_id'], kwargs['api_key'])
        response = amp_api.index()
        return self.render_json(response['data'])

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET', 'POST'])
    def save_stream(self, **kwargs):
        amp_api = ApiService(kwargs['api_host'], kwargs['api_id'], kwargs['api_key'])
        storage = AmpStorageWrapper(self.__metadata(kwargs.get('name')))
        stream = storage.find_stream()
        if stream is None:
            logger.info('Controller - Creating the stream at API')
            response = amp_api.create(kwargs)
            logger.info('Controller - Created the stream at API: {}'.format(kwargs.get('name')))
            storage.save_stream_with_data(StreamDictManager(response['data']).merged_with(kwargs))
        else:
            dict_manager = StreamDictManager(stream)
            diff = dict_manager.diff_fields_from(kwargs)
            if len(diff) > 0:
                logger.info('Controller - Updating the stream at API {}'.format(stream.get('name')))
                amp_api.update(stream['id'], diff)
                storage.save_stream_with_data(dict_manager.merged_with(kwargs))
                logger.info('Controller - Updated the stream at API')
        output = jsonresponse.JsonResponse()
        output.success = True
        return self.render_json(output)

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET', 'DELETE'])
    def delete_stream(self, **kwargs):
        amp_api = ApiService(kwargs['api_host'], kwargs['api_id'], kwargs['api_key'])
        storage = AmpStorageWrapper(self.__metadata(kwargs.get('name')))
        stream = storage.find_stream()
        if stream is not None:
            logger.info('Controller - Deleting the stream at API: {}'.format(stream.get('name')))
            self.__try_destroy_stream(amp_api, stream['id'])
            storage.delete_stream()
        output = jsonresponse.JsonResponse()
        output.success = True
        return self.render_json(output)

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET', 'DELETE'])
    def delete_event_stream(self, **kwargs):
        amp_api = ApiService(kwargs['api_host'], kwargs['api_id'], kwargs['api_key'])
        self.__try_destroy_stream(amp_api, kwargs['id'])
        output = jsonresponse.JsonResponse()
        output.success = True
        return self.render_json(output)

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET'])
    def event_types_list(self, **kwargs):
        amp_api = ApiService(kwargs['api_host'], kwargs['api_id'], kwargs['api_key'])
        response = amp_api.event_types()
        return self.render_json(response['data'])

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET'])
    def groups_list(self, **kwargs):
        amp_api = ApiService(kwargs['api_host'], kwargs['api_id'], kwargs['api_key'])
        response = amp_api.groups()
        return self.render_json(response['data'])

    @jsonify_errors
    @expose_page(must_login=True, methods=['POST'])
    def save_api_key(self, **kwargs):
        session_key = cherrypy.session.get('sessionKey')
        service = client.connect(token=session_key)
        service.storage_passwords.create(kwargs['api_key'], kwargs['api_id'])
        output = jsonresponse.JsonResponse()
        output.success = True
        return self.render_json(output)

    @jsonify_errors
    @expose_page(must_login=True, methods=['GET'])
    def fetch_api_key(self, **kwargs):
        session_key = cherrypy.session.get('sessionKey')
        service = client.connect(token=session_key)
        storage_passwords = service.storage_passwords
        api_key = None
        for storage_password in storage_passwords:
            if kwargs['api_id'] in storage_password.name:
                api_key = storage_password.clear_password
                break
        output = jsonresponse.JsonResponse()
        output.success = True
        output.api_key = api_key
        return self.render_json(output)

    def __json_error(self, payload):
        output = jsonresponse.JsonResponse()
        output.error = payload
        output.success = False
        return self.render_json(output)

    def __metadata(self, name):
        return {
            'name': name,
            'session_key': cherrypy.session.get('sessionKey'),
            'server_uri': self.splunkd_urlhost
        }

    def __try_destroy_stream(self, amp_api, stream_id):
        try:
            amp_api.destroy(stream_id)
        except ApiError as e:
            if not e.stream_is_not_found:
                raise e
