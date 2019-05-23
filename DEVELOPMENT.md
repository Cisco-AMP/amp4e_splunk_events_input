## Cisco AMP for Endpoints Events Input development instructions

The Cisco AMP for Endpoints Events Input provides a mechanism to create, update, and delete event streams in
Cisco Advanced Malware Protection (AMP) for Endpoints via the API and index them in your Splunk® instance to make them
searchable. All you need to do is provide your API host and credentials from your AMP for Endpoints account and specify
the stream parameters (like events or which event types and groups should be directed to this stream).
This app was tested on Splunk v6.6.0.

Essentially the app is a Splunk Modular Input with custom interface and custom-wrapped actions.

### Prerequisites

You need a local instance of Splunk Enterprise in order to use and develop this software. This app was developed with
Python 2.7

### Installing

1. You can clone the project into any directory and then link the directory to `$SPLUNK_HOME/etc/apps/amp4e_events_input`.
2. To install the app dependencies with pip, within the project root run
`pip install -r bin/requirements-splunk.txt --target=bin`.
3. Install requests_mock as it's the dependency for the tests: `pip install 'requests_mock==1.3.0'`
4. Restart Splunk

After these actions you will have the app installed and can get to coding. Please note that in order to have your
changes reflected you'll have to restart the Splunk instance.

All input logging gets directed to `$SPLUNK_HOME/var/log/splunk/amp4e_events_input.log`

### Running the tests

- Enter your admin credentials in test/support/config.py
- To run all unit tests, `python -m unittest discover`.
- If you'd like to run a single test, refer to it as to a module:
    `python -m unittest test.amp4e_events_input.test_stream_dict_manager`


### Understanding the input lifecycle

Each input is directly connected to the entity within AMP for Endpoints which is called an *event stream*. Each new event stream
requires a name to generate a queue. You can filter the event stream by specifying the event types or Connector groups to be ingested.
If you create an event stream without specifying any event types or Connector groups, all events will be ingested.
By interacting with the input the user is in fact modifying the event stream at AMP for Endpoints.

**Creating/updating**

The only difference between creating and updating the input is that on create user can set the input's name and Splunk
index to direct events to.

When a user fills out the AMP for Endpoints Events Input form, the parameters first get sent to custom Splunk endpoint, *save_stream*
(within amp_streams_api_controller). There, a KV Store lookup is performed (this will be clarified further) to find out
if the input with this name already exists:
- If it does not, we start the create procedure - the parameters are sent to
*create* Event Streams API endpoint, where they get validated (any validation failures are then displayed in Splunk
interface). If the validation passes, a new KV store item gets created with combined data from input and newly-created
 event stream, only then the input itself gets stored at Splunk.
- If it does, the update procedure kicks in - parameters are sent to *update* Event Streams API endpoint, and the same
procedure as on *create* gets repeated, save for the KV store item which is not created, but updated with new data.

As soon as the input gets created, Splunk launches the consumer for RabbitMQ queue that corresponds to the event stream.
Upon receiving a message, the consumer publishes it as an Event to Splunk index (specified on input creation)


**Listing**

All inputs are listed as they are stored in Splunk. No API lookups are performed here.


**Deleting**

As soon as the user confirms the input deletion, a request is sent to custom Splunk endpoint, *delete_stream*, which
deletes the stream at Event Streams API and from KV Store. Then, the Splunk input gets deleted.


### Contributing

If you've developed a feature, don't hesitate to submit a pull request for review!
Please make sure your code is properly documented and tested, as it will facilitate fast reviewing.

### Authors

This project was developed by Cisco AMP For Endpoints team

### License

This project is licensed under the BSD 2-clause "Simplified" License - see the [LICENSE](LICENSE) file for details

### Acknowledgments

* [Luke Murphey](https://github.com/LukeMurphey). Some front-end parts of the project were based on Luke's findings in
[Splunk Web Input](https://github.com/LukeMurphey/splunk-web-input)
* Brian from Northern Trust
