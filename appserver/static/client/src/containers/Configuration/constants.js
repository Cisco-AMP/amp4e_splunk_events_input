import { splunkdPath } from "@splunk/splunk-utils/config"

export const NO_CONFIG_CAPABILITIES_MESSAGE =
  "Sorry, you don't have permission to perform setup"
export const CONFIGURATION_LEGEND = "AMP for Endpoints API Access Configuration"

export const API_HOST_LABEL = "AMP for Endpoints API Host"
export const API_HOST_HELP =
  "Enter the address of the Cisco AMP for Endpoints API Server that\n" +
  "              the application will access for managing event streams. Please\n" +
  "              refer to the AMP for Endpoints API documentation for the correct\n" +
  "              hostname"

export const API_ID_LABEL = "API Client ID"
export const API_ID_HELP =
  "Enter the 3rd Party API Client ID provided by AMP for Endpoints.\n" +
  "Please note that your API Client must have read and write scope"

export const API_KEY_LABEL = "API Key"
export const API_KEY_HELP = "Enter the secret API key"

export const SAVE_BUTTON = "Save Configuration"

export const CONFIG_SAVE_ERROR =
  "Configuration could not be saved. Form is not valid."

export const CONFIG_SAVE_SUCCESS = "Configuration successfully saved"

export const configURL = `${splunkdPath}/services/configs/conf-inputs/amp4e_events_input?output_mode=json`

export const saveConfigURL = `${splunkdPath}/servicesNS/nobody/amp4e_events_input/configs/conf-inputs/amp4e_events_input`
