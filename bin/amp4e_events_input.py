import sys
import time
import traceback
import json

from splunklib.modularinput import Argument, Event, Scheme, Script

from amp4e_events_input.amp_storage_wrapper import AmpStorageWrapper
from util.logger import logger
from util.stream_consumer import StreamConsumer


class Amp4eEventsInput(Script):
    # name: [description, required_on_create, required_on_edit]
    SCHEME_ARGUMENTS = {
        'stream_name': ['The event stream name', True, True],
        'event_types': ['Enter event type evt_ids for the stream', True, True],
        'groups': ['Enter group guids for the stream', False, False],
        'api_host': ['AMP API host', True, True],
        'api_id': ['3rd Party API Client ID provided by AMP', True, True],
        'api_key': ['API secret', True, True]
    }
    RMQ_HOST = '192.168.50.6'  # fetch from env?
    RMQ_PORT = '5672'
    AMP_HOST = 'https://portal'

    def get_scheme(self):
        scheme = Scheme('Cisco AMP for Endpoints Events Input')
        scheme.description = 'Allows creating and managing event streams from AMP'
        scheme.use_external_validation = False
        scheme.use_single_instance = False
        self.__add_scheme_arguments(scheme)
        return scheme

    # DEPRECATED within app. Use only if necessary
    # https://docs.splunk.com/Documentation/SplunkCloud/6.6.0/AdvancedDev/ModInputsValidate
    def validate_input(self, validation_definition):
        pass

    # Runs once on splunk restart and then gets called every time new input is created
    # Checks if the stream needs to be deleted (i.e. user
    # deleted it) and performs the deletion via API (?).
    # Tries to set up the RabbitMQ connection with credentials from current stream.
    # If stream doesn't exist yet, exits.
    # Otherwise, fetches all events from queue and writes them to logs.
    def stream_events(self, inputs, ew):
        for input_name, _ in inputs.inputs.items():
            logger.debug('Starting input ' + input_name)
            inputs.metadata['name'] = input_name.split('://', 1)[-1]
            stream = self.__stream_from_inputs(inputs)
            connection_data = stream.get('amqp_credentials')
            if connection_data is not None:
                consumer = StreamConsumer(connection_data,
                                          lambda event: self.__on_event_callback(event, ew,
                                                                                 {'input_name': input_name,
                                                                                  'host': stream.get('api_host'),
                                                                                  'index': stream.get('index')}))
                try:
                    consumer.run()
                    break  # break if we somehow have more than one input here
                except Exception as e:
                    logger.error(traceback.format_exc())
                    time.sleep(3)
                    raise e

    def __add_scheme_arguments(self, scheme):
        for name, [description, required_on_create, required_on_edit] in self.SCHEME_ARGUMENTS.items():
            scheme.add_argument(Argument(name=name,
                                         data_type=Argument.data_type_string,
                                         description=description,
                                         required_on_create=required_on_create,
                                         required_on_edit=required_on_edit))

    def __stream_from_inputs(self, inputs):
        storage = AmpStorageWrapper(inputs.metadata)
        stream = storage.find_stream()
        logger.debug('Found Stream: ' + str(stream))
        # connection_data = stream['amqp_credentials']
        # Change this in development if we have no correct data from API
        # connection_data.update({'host': self.RMQ_HOST, 'port': self.RMQ_PORT})
        return stream

    def __on_event_callback(self, event_json, ew, options):
        logger.debug('Received event with input {}'.format(options['input_name']))
        index = options['index'] if options.get('index') is not None else 'main'
        host = options['host'] if options.get('host') is not None else 'Cisco AMP For Endpoints'
        decoded_event = json.loads(event_json)
        # decoded_event['timestamp'] = time.time()  # commented out for real-time events
        event = Event(stanza=options['input_name'], data=json.dumps({'event': decoded_event}), host=host,
                      sourcetype='cisco:amp:event', index=index)
        logger.debug('Publishing event to index {} with host {}...'.format(index, host))
        ew.write_event(event)
        logger.debug('Published.')


if __name__ == "__main__":
    sys.exit(Amp4eEventsInput().run(sys.argv))
