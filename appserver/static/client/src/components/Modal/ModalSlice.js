import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  verbiage: {
    title: "",
    body: "",
    submit: "",
    cancel: "Cancel"
  },
  isShown: false
}

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (state, action) => {
      state.verbiage = action.payload
      state.isShown = true
    },
    hideModal: (state) => {
      state.verbiage = initialState.verbiage
      state.isShown = false
    }
  }
})

export const { showModal, hideModal } = modalSlice.actions

export default modalSlice.reducer
