## Outline code design of the App

* `appserver/controllers/`
  * `amp_streams_api_controller.py` - responds to the user input and performs interactions on the API data.
    * `event_streams_list` - fetches all event streams.
    * `save_stream` - creates a new event stream if it doesn’t exist otherwise updates the existing one.
    * `delete_stream` - deletes event stream from the API and deletes input from the Splunk app.
    * `delete_event_stream` - deletes event stream from the API which is not linked to any Splunk inputs.
    * `event_types_list` - fetches all event types for showing in the Event Types field.
    * `groups_list` - fetches all groups for showing in the Groups field.
* `appserver/static/css/`
  * `Amp4EventsInputCreateView.css` - stores all CSS styles for New Input page.
  * `Amp4EventsInputListView.css` - stores all CSS styles for Inputs page.
* `appserver/static/js/templates/`
  * `Amp4EventsInputCreateView.html` - HTML template for New Input page.
  * `Amp4EventsInputListView.html` - HTML template for Inputs page.
  * `AmpSetupView.html` - HTML template for Configuration page.
* `appserver/static/js/views/`
  * `Amp4EventsInputCreateView.js` - JS methods for New Input page.
  * `Amp4EventsInputListView.js` - JS methods for Inputs page.
  * `SetupView.js` - common configurations of the app.
  * `ValidationView.js` - validation methods for all forms.
* `bin/app4e_events_input/`
  * `amp_storage_wrapper.py` - interacts with Splunk's KV store to persist data about amp streams.
  * `stream_dict_manager.py` - transforms the stream data for API parameters and back, checks for diffs between stream data hashes.
* `bin/util/`
  * `api_service.py` - class for working with API and API exceptions
    * `index` - fetches all event stream (GET /v1/event_streams)
    * `show` - fetches event stream by id (GET /v1/event_streams/:id)
    * `create` - creates an event stream (POST /v1/event_streams)
    * `update` - updates event stream by id (PATCH /v1/event_streams/:id)
    * `destroy` - deletes event stream by id (DELETE /v1/event_streams/:id)
    * `event_types` - fetches all event types (GET /v1/event_types)
    * `groups` - fetches all groups (GET /v1/groups)
  * `logger.py` - logs everything that we need.
  * `stream_consumer.py` - sets a connection to RabbitMQ and receiving messages.
* `release/` - classes for creating a package for release on Splunkbase.
* `tests/` - stored all tests.

## Guide to validate that everything is working

  1. Go to New Input page and create input. Name and Stream Name fields are required. Index field - choose in which index would you like the events to appear. Event Types and Groups fields - choose for which event types and groups would you like the events to belong (leave empty to belong for all of them).

  2. Go to Inputs page to make sure new input was created successfully.

  3. Go to Search & Reporting page for searching events. Fill in the search field by params you want the events to respond. For example index=”main” will show you all events which belong to event types and groups from inputs with this index.
