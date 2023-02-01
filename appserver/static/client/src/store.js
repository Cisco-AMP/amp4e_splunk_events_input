import { configureStore } from "@reduxjs/toolkit"
import { InputListSlice as inputsList } from "./containers/InputsList"
import { ModalSlice as modal } from "./components/Modal"
import { CreateInputSlice as createInput } from "./containers/CreateInput"
import { MessagesSlice as messages } from "./components/Messages"
import { ConfigurationSlice as configuration } from "./containers/Configuration"

export const store = configureStore({
  reducer: {
    createInput,
    configuration,
    inputsList,
    messages,
    modal
  }
})
