import { createSlice } from "@reduxjs/toolkit"
import {
  DANGER_MESSAGE_TYPE,
  ERROR_MESSAGE_TYPE,
  INFO_MESSAGE_TYPE
} from "./constants"

const initialState = {
  type: "",
  isShown: false,
  message: ""
}

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    showInfoMessage(state, action) {
      state.type = INFO_MESSAGE_TYPE
      state.isShown = true
      state.message = action.payload
    },
    showErrorMessage(state, action) {
      state.type = ERROR_MESSAGE_TYPE
      state.isShown = true
      state.message = action.payload
    },
    showDangerMessage(state, action) {
      state.type = DANGER_MESSAGE_TYPE
      state.isShown = true
      state.message = action.payload
    },
    hideMessages(state) {
      state.type = ""
      state.isShown = false
      state.message = ""
    }
  }
})

export const {
  showInfoMessage,
  showErrorMessage,
  showDangerMessage,
  hideMessages
} = messagesSlice.actions

export default messagesSlice.reducer
