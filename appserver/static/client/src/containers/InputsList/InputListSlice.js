import { splunkdPath } from "@splunk/splunk-utils/config"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { CONTROLLER_URL } from "./constants"
import { showErrorMessage } from "../../components/Messages/MessagesSlice"

export const fetchInputs = createAsyncThunk(
  "fetchInputs",
  async () =>
    await fetch(
      `${splunkdPath}/services/data/inputs/amp4e_events_input?count=-1&output_mode=json`,
      {
        method: "GET"
      }
    ).then((response) => response.json())
)

export const fetchStreams = createAsyncThunk(
  "fetchStreams",
  async (_, { getState }) => {
    const { apiId, apiHost, apiKey } = getState()?.configuration.data

    return await fetch(
      `${CONTROLLER_URL}event_streams_list?api_host=${apiHost}&api_id=${apiId}&api_key=${apiKey}`,
      {
        method: "GET"
      }
    ).then((response) =>
      response.json().then((parsedResponse) => {
        if (parsedResponse.success === false) {
          return []
        }
        return parsedResponse
      })
    )
  }
)

export const deleteInput = createAsyncThunk(
  "deleteInput",
  async (
    { name, acl: { owner, app }, content: { stream_name } },
    { getState, dispatch }
  ) => {
    try {
      const { apiId, apiHost, apiKey } = getState()?.configuration.data

      const response = await fetch(
        `/custom/amp4e_events_input/amp_streams_api_controller/delete_stream?api_host=${apiHost}&api_id=${apiId}&api_key=${apiKey}&name=${name}`,
        {
          method: "DELETE"
        }
      ).then((response) => response.json())

      if (response.error) {
        console.info("There is been an error", response.error)
        dispatch(showErrorMessage("There is been an error."))
        return
      }

      await fetch(
        `${splunkdPath}/servicesNS/${owner}/${app}/data/inputs/amp4e_events_input/${encodeURIComponent(
          name
        )}`,
        {
          method: "DELETE",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-Splunk-Form-Key": document.cookie.match(
              /splunkweb_csrf_token_8000=(\d+)/
            )[1]
          }
        }
      )

      return { success: response.success, name, streamName: stream_name }
    } catch (e) {
      console.info("Could not delete the input.")
    }
  }
)

export const deleteStream = createAsyncThunk(
  "deleteStream",
  async ({ id }, { getState }) => {
    try {
      const { apiId, apiHost, apiKey } = getState()?.configuration.data

      const response = await fetch(
        `/custom/amp4e_events_input/amp_streams_api_controller/delete_event_stream?api_host=${apiHost}&api_id=${apiId}&api_key=${apiKey}&id=${id}`,
        {
          method: "DELETE"
        }
      ).then((response) => response.json())

      return { success: response.success, id }
    } catch (e) {
      console.info("Could not delete the stream.")
    }
  }
)

const initialState = {
  inputs: {
    data: [],
    pending: false
  },
  streams: {
    data: [],
    pending: false
  }
}

export const inputsListSlice = createSlice({
  name: "inputsList",
  initialState,
  extraReducers: async (builder) => {
    builder.addCase(fetchInputs.pending, (state) => {
      state.inputs = {
        ...state.inputs,
        pending: true
      }
    })
    builder.addCase(fetchInputs.fulfilled, (state, action) => {
      state.inputs = {
        data: action.payload.entry,
        pending: false
      }
    })
    builder.addCase(fetchStreams.pending, (state) => {
      state.streams = {
        ...state.streams,
        pending: true
      }
    })
    builder.addCase(fetchStreams.fulfilled, (state, action) => {
      state.streams = {
        data: action.payload,
        pending: false
      }
    })
    builder.addCase(deleteInput.fulfilled, (state, action) => {
      if (action.payload?.success) {
        console.info("Input deleted")
        state.inputs = {
          data: state.inputs.data.filter(
            ({ name }) => name !== action.payload.name
          ),
          pending: false
        }

        state.streams = {
          data: state.streams.data.filter(
            ({ name }) => name !== action.payload.streamName
          ),
          pending: false
        }
      }
    })
    builder.addCase(deleteStream.fulfilled, (state, action) => {
      if (action.payload?.success) {
        console.info("Stream deleted")
        state.streams = {
          data: state.streams.data.filter(({ id }) => id !== action.payload.id),
          pending: false
        }
      }
    })
  }
})

export default inputsListSlice.reducer
