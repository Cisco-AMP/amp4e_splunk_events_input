# Changelog

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
