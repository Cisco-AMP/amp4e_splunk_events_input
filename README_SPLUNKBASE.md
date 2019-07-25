[comment]: <> (Readme for splunkbase)

# Cisco AMP for Endpoints Events Input

## Introduction

This input provides a mechanism to create, update, and delete event streams in Cisco Advanced Malware Protection (AMP) for Endpoints via the API and index them in your Splunk® instance to make them searchable. All you need to do is provide your API host and credentials from your AMP for Endpoints account and specify the stream parameters (like events or which event types and groups should be directed to this stream).
This app was tested on Splunk v7.0

## Prerequisites

It is expected that a user of this app:

* is familiar with Cisco AMP for Endpoints and understands the concepts of AMP business, events, event types, and groups.
* has an account within a working instance of the cloud hosted version of AMP for Endpoints Console. At this point, there is no support for private cloud AMP for endpoint appliances
* has a set of Read/Write AMP API credentials.
* knows how to access the event types and groups API endpoints in order to retrieve the codes of event types and guids of groups.

### Connections

Please ensure that the following url endpoints are open

| Public Cloud Regions AMP for Endpoints | URL endpoint | port | protocol |
| --- | --- | --- | --- |
| North America | api.amp.cisco.com, export-streaming.amp.cisco.com | 443 | TCP |
| Europe | api.eu.amp.cisco.com, export-streaming.eu.amp.cisco.com | 443 | TCP |
| Asia Pacific | api.apjc.amp.cisco.com, export-streaming.apjc.amp.cisco.com | 443 | TCP |

## Architecture

This app comes with a custom interface to ensure that every meaningful action (like creating, editing, or deleting an input)
yields expected results.
Please note: This app interacts with a third-party service, namely, Cisco Advanced Malware Protection (AMP) for Endpoints.
This app also uses Splunk’s built-in key-value store for persisting crucial information about event streams.

## Installation

This app can be installed directly from Splunkbase. The app will appear in your Splunk Apps navigation bar after it is
successfully installed. When you visit one of the app pages, it will ask you to provide settings on the configuration page.
The configuration contains options related to authenticating to the AMP server by API calls, specifically:

* API host (Web address of the Cisco AMP for Endpoints API found in the AMP for Endpoints API documentation)
* API id (3rd Party API Client ID provided by AMP for Endpoints. The credentials must allow read and write access.)
* API key (API secret key that corresponds to the API id above.)

Once these have been configured you are ready to create and use the inputs.

## Use cases

### Creating an input

You need to create the input to have the events flow into your index. To do this, go to the app interface and navigate to
‘New Input’. If your app is properly configured, you can populate the fields:

* ‘Name’ should contain the Input name. The Name must be unique and cannot be changed later. If you attempt to create an input with the Name of an input that already exists, the validation will fail.
* 'Index' contains the Splunk index the events will be directed to. It defaults to 'main', however you can specify any index within your instance. The index cannot be changed after the input is saved.
* ‘Stream name’ should contain the unique name of an event stream. Since event streams can be created not only from Splunk app, but also via the API interface, this name serves a purpose of distinguishing the streams.
* ‘Event Types’ allows you to select one or more event types to direct to the stream. You can only select event types that are accessible by your business. Leave this field blank to return all event types.
* ‘Groups’ allows you to select one or more connector groups to direct to the stream. Leave this field blank to return all groups in the business.

When you click ‘Save’, the stream with the parameters you provided will be created within AMP for Endpoints.
If there is a validation failure, the appropriate message will be displayed.
Leave either the Event Type or Groups field blank to direct all respective event types or groups to the created stream and the Splunk index.
Please note: the number of event streams per business is limited to 5.

### Updating an input

To update an input, click on its name at the inputs list view. Follow the procedures described previously to change the
stream parameters. Please note: you will not be able to edit the input name or index.

### Deleting an input

To delete an input, click the ‘Delete’ link in its row at the inputs list view. Confirm your choice to finish the procedure.
The event stream will be deleted from AMP for Endpoints along with the input.

### Searching for events

By default, the events from the stream will be directed to the ‘main’ index. They will be populated with the sourcetype of cisco:amp:event

## Support

This project is open-source, please seek guidance at project's [github page](https://github.com/Cisco-AMP/amp4e_splunk_events_input).

## Known Issues

### Errors

```bash
ValueError: Expected instance of Parameters, not <URLParameters host=export-streaming.amp.cisco.com port=443 virtual_host=/ ssl=True>
```

* This error occurs when two instances of the Pika library are included in your installation. If you encounter this error, check to see if the folder `$SPLUNK_HOME/etc/apps/amp4e_events_input/bin/pika/pika` exists on your Splunk server. If it does, remove it with:

```bash
$ rm -rf $SPLUNK_HOME/etc/apps/amp4e_events_input/bin/pika/pika
```
