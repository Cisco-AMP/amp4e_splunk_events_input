# Changelog

### 1.1.8
- Converts api key from unsecured to secured using splunk's storage passwords API
- Creating a new input configuration and stream will not save the api key in your input
- To migrate your existing app, go to the app's main page, click and edit your linked stream and click Save
- After you migrate your app, the api key is removed from all your input stanzas

### 1.1.4
- Fix https://github.com/Cisco-AMP/amp4e_splunk_events_input/issues/10

### 1.1.2
- Add support proxies
- Add certificate support through splunk config or env variable

### 1.1.0
- Add Unlinked Event Streams and Unlinked Inputs functionality
- Fix wording across the app
- Display event and group names on inputs list
- Add a better message while input is being stored

### 1.0.8
- Provide information about RequestException to ApiError in order to log it properly
- Fetch Splunk URI for Service from metadata instead of a constant
- Add diag tool
- Remove logging of all API responses from ApiService
