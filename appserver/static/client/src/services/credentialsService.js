const getApiKeyURL = (endPoint) => `/en-US/custom/amp4e_events_input/amp_streams_api_controller/${endPoint}`

const configURL = '/en-US/splunkd/__raw/services/configs/conf-inputs/amp4e_events_input?output_mode=json'

export const saveAPIKey = async (apiId, apiKey) => {
  try {
    await fetch(
      getApiKeyURL('save_api_key'),
      {
        method: 'POST',
        body: {
          api_id: apiId,
          api_key: apiKey
        }
      }
    )
  } catch (e) {
    console.error(e)
  }
}


export const fetchAPIKey = (apiId) => {
  try {
    return fetch(
      getApiKeyURL(`fetch_api_key?api_id=${apiId}`),
      {
        method: 'GET',
      }
    ).then(response => response.json().then(({ success, api_key }) => success && api_key))
  } catch (e) {
    console.error(e)
  }
}

export const fetchConfig = () => {
  try {
    return fetch(
      configURL,
      {
        method: 'GET',
      }
    ).then(response => response.json().then(({ entry }) => (
      entry[0].content
    )))
  } catch (e) {
    console.error(e)
  }
}
