import InputsList from "./containers/InputsList/InputsList"
import CreateInput from "./containers/CreateInput/CreateInput"

export const navs = {
  "/en-US/app/amp4e_events_input/amp4e_events_input_list_new": {
    id: "inputsList",
    title: "Inputs",
    view: <InputsList />
  },
  "/en-US/app/amp4e_events_input/create_amp4e_events_input_new": {
    id: "createInput",
    title: "New Input",
    view: <CreateInput />
  },
  "/en-US/app/amp4e_events_input/setup_amp4e_events_input_new": {
    id: "configuration",
    title: "Configuration",
    view: "Configuration"
  }
}
