import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { fetchAPIKey, fetchConfig } from "../../services/credentialsService"
import { CONTROLLER_URL } from "../InputsList/constants"

export const fetchIndexes = createAsyncThunk(
  "fetchIndexes",
  async () =>
    await fetch(
      "/en-US/splunkd/__raw/services/data/indexes?output_mode=json&search=isInternal%3Dfalse+disabled%3Dfalse&count=-1",
      {
        method: "GET"
      }
    ).then((response) => response.json())
)

export const fetchEventTypes = createAsyncThunk("fetchEventTypes", async () => {
  const { api_id, api_host } = await fetchConfig()
  const apiKey = await fetchAPIKey(api_id)

  return await fetch(
    `${CONTROLLER_URL}event_types_list?api_host=${api_host}&api_id=${api_id}&api_key=${apiKey}`,
    {
      method: "GET"
    }
  ).then((response) => response.json())
})

export const fetchGroups = createAsyncThunk("fetchGroups", async () => {
  const { api_id, api_host } = await fetchConfig()
  const apiKey = await fetchAPIKey(api_id)

  return await fetch(
    `${CONTROLLER_URL}groups_list?api_host=${api_host}&api_id=${api_id}&api_key=${apiKey}`,
    {
      method: "GET"
    }
  ).then((response) => response.json())
})

export const saveWithAPI = createAsyncThunk("saveWithAPI", async (data) => {
  const { api_id, api_host } = await fetchConfig()
  const apiKey = await fetchAPIKey(api_id)

  const body = new URLSearchParams({
    ...data,
    api_host: api_host,
    api_id: api_id,
    api_key: apiKey
  })

  const response = await fetch(`${CONTROLLER_URL}save_stream`, {
    method: "POST",
    body: body,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-Splunk-Form-Key": document.cookie.match(
        /splunkweb_csrf_token_8000=(\d+)/
      )[1]
    }
  }).then((response) => response.json())

  if (response.error) {
    console.info(
      "Input could not be saved due to server error",
      response.error.error
    )
    return
  }

  await fetch(
    `/en-US/splunkd/__raw/servicesNS/nobody/amp4e_events_input/data/inputs/amp4e_events_input/${data.name}`,
    {
      method: "POST",
      body: body,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-Splunk-Form-Key": document.cookie.match(
          /splunkweb_csrf_token_8000=(\d+)/
        )[1]
      }
    }
  ).then((response) => response.json())
})

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
  }
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
  }
})

export default createInputSlice.reducer
