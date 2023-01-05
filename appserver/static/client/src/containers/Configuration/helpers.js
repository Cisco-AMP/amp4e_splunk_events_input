import { locale } from "@splunk/splunk-utils/config"

export const handleValidate = ({ apiHost, apiId, apiKey }) =>
  apiHost.length && apiId.length && apiKey.length
    ? {}
    : {
        apiHost: !apiHost.length && "Is required",
        apiId: !apiId.length && "Is required",
        apiKey: !apiKey.length && "Is required"
      }

export const createInitialValues = ({ apiHost, apiId, apiKey }) => ({
  apiHost,
  apiId,
  apiKey
})

export const getApiKeyURL = (endPoint) =>
  `/${locale}/custom/amp4e_events_input/amp_streams_api_controller/${endPoint}`
