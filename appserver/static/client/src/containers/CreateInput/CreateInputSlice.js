import { splunkdPath } from "@splunk/splunk-utils/config"
import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit"
import { CONTROLLER_URL } from "../InputsList/constants"
import {
  showDangerMessage,
  showErrorMessage
} from "../../components/Messages/MessagesSlice"
import {
  CREATE_INPUT_ERROR_IN_LOG,
  CREATE_INPUT_ERROR_TITLE,
  SERVER_ERROR_MESSAGE,
  WRONG_CONFIG_ERROR
} from "./constants"
import { getSplunkHeader } from "./helpers"

export const fetchIndexes = createAsyncThunk(
  "fetchIndexes",
  async () =>
    await fetch(
      `${splunkdPath}/services/data/indexes?output_mode=json&search=isInternal%3Dfalse+disabled%3Dfalse&count=-1`,
      {
        method: "GET"
      }
    ).then((response) => response.json())
)

export const fetchEventTypes = createAsyncThunk(
  "fetchEventTypes",
  async (_, { getState, dispatch }) => {
    const { apiId, apiHost, apiKey } = getState()?.configuration.data

    return await fetch(
      `${CONTROLLER_URL}event_types_list?api_host=${apiHost}&api_id=${apiId}&api_key=${apiKey}`,
      {
        method: "GET"
      }
    ).then((response) =>
      response.json().then((parsedResponse) => {
        if (parsedResponse.success === false) {
          dispatch(showDangerMessage(WRONG_CONFIG_ERROR))
          return []
        }
        return parsedResponse
      })
    )
  }
)

export const fetchGroups = createAsyncThunk(
  "fetchGroups",
  async (_, { getState, dispatch }) => {
    const { apiId, apiHost, apiKey } = getState()?.configuration.data

    return await fetch(
      `${CONTROLLER_URL}groups_list?api_host=${apiHost}&api_id=${apiId}&api_key=${apiKey}`,
      {
        method: "GET"
      }
    ).then((response) =>
      response.json().then((parsedResponse) => {
        if (parsedResponse.success === false) {
          dispatch(showDangerMessage(WRONG_CONFIG_ERROR))
          return []
        }
        return parsedResponse
      })
    )
  }
)

export const saveInput = createAsyncThunk(
  "saveInput",
  async (data, { getState, dispatch }) => {
    const { apiId, apiHost } = getState()?.configuration.data

    const body = new URLSearchParams({
      ...data,
      api_host: apiHost,
      api_id: apiId
    })

    await fetch(
      `${splunkdPath}/servicesNS/nobody/amp4e_events_input/data/inputs/amp4e_events_input/${data.name}`,
      {
        method: "POST",
        body: body,
        headers: getSplunkHeader()
      }
    ).then((response) => {
      if (response.status === 201) {
        window.location.assign("amp4e_events_input_list_new")
      } else {
        dispatch(showErrorMessage(CREATE_INPUT_ERROR_IN_LOG))
      }
    })
  }
)

export const saveWithAPI = createAsyncThunk(
  "saveWithAPI",
  async (data, { getState, dispatch }) => {
    const { apiId, apiHost, apiKey } = await getState()?.configuration.data

    const body = new URLSearchParams({
      ...data,
      api_host: apiHost,
      api_id: apiId,
      api_key: apiKey
    })
    try {
      await fetch(`${CONTROLLER_URL}save_stream`, {
        method: "POST",
        body: body,
        headers: getSplunkHeader()
      }).then((response) => {
        response.json().then(async ({ success, error }) => {
          if (success) {
            await dispatch(saveInput(data))
          } else {
            dispatch(
              showErrorMessage(
                <>
                  {CREATE_INPUT_ERROR_TITLE}
                  <br />
                  {(error || [])
                    .map((err) => err.details.join(<br />))
                    .join(<br />)}
                </>
              )
            )
          }
        })
      })
    } catch (e) {
      dispatch(showErrorMessage(SERVER_ERROR_MESSAGE + e))
    }
  }
)

const initialState = {
  indexes: {
    data: [],
    pending: false
  },
  eventTypes: {
    data: [],
    pending: false
  },
  groups: {
    data: [],
    pending: false
  },
  pending: false
}

export const createInputSlice = createSlice({
  name: "createInput",
  initialState,
  extraReducers: async (builder) => {
    builder.addCase(fetchIndexes.pending, (state) => {
      state.indexes = {
        ...state.indexes,
        pending: true
      }
    })
    builder.addCase(fetchIndexes.fulfilled, (state, action) => {
      state.indexes = {
        data: action.payload.entry,
        pending: false
      }
    })
    builder.addCase(fetchEventTypes.pending, (state) => {
      state.eventTypes = {
        ...state.eventTypes,
        pending: true
      }
    })
    builder.addCase(fetchEventTypes.fulfilled, (state, action) => {
      state.eventTypes = {
        data: action.payload,
        pending: false
      }
    })
    builder.addCase(fetchGroups.pending, (state) => {
      state.groups = {
        ...state.groups,
        pending: true
      }
    })
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.groups = {
        data: action.payload,
        pending: false
      }
    })
    builder.addCase(saveWithAPI.pending, (state) => {
      state.pending = true
    })
    builder.addMatcher(
      isAnyOf(saveWithAPI.rejected, saveWithAPI.fulfilled),
      (state) => {
        state.pending = false
      }
    )
  }
})

export default createInputSlice.reducer
