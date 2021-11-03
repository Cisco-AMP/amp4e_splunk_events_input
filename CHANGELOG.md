# Changelog

### 2.0.2
- Fixed an issue where creating or editing an input would fail in some cases

### 2.0.1
- Adds Splunk 8 and Python 3 support

### 1.1.8
- Converts api key from unsecured to secured using Splunk's storage passwords API
- Creating a new input configuration and stream will not save the api key in your input.conf file
- To migrate your existing app and input configurations:
  - Make sure you have your API ID and key written down or copied to a file **before installation**
  - Install version 1.1.8 of the app
  - Restart Splunk
  - Visit https://\<your splunk address\>/en-US/_bump and click the 'Bump version' button
  - Your app config will be automatically updated when visiting the inputs page
    - If you see the error message **Warning! It appears your configuration is incomplete, so you will not be able to create any inputs. Please update your configuration.** when first visiting the page after updating, try refreshing
    - If that doesn't work, visit the configuration page and ensure your configuration is correct
  - To update the config for your inputs, visit the Inputs page of the app and click on the name of each of your inputs to edit them, then click the 'Save' button
  - Your API key will now only be stored using Splunk's storage passowrds API and will no longer be stored in the inputs.conf file
- When installing this app for the first time, no special action needs to be taken

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
