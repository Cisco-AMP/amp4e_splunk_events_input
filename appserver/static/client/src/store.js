import { configureStore } from "@reduxjs/toolkit"
import inputsListReducer from "./containers/InputsList/InputListSlice"
import modalReducer from "./components/Modal/ModalSlice"
import createInput from "./containers/CreateInput/CreateInputSlice"

export const store = configureStore({
  reducer: {
    inputsList: inputsListReducer,
    modal: modalReducer,
    createInput: createInput
  }
})
