import InputsList from "./containers/InputsList"
import CreateInput from "./containers/CreateInput"
import Configuration from "./containers/Configuration"

export const navs = [
  {
    path: `amp4e_events_input_list_new`,
    id: "inputsList",
    title: "Inputs",
    view: <InputsList />
  },
  {
    path: `create_amp4e_events_input_new`,
    id: "createInput",
    title: "New Input",
    view: <CreateInput />
  },
  {
    path: `edit_amp4e_events_input_new`,
    id: "editInput",
    title: "Edit Input",
    view: <CreateInput />
  },
  {
    path: `setup_amp4e_events_input_new`,
    id: "configuration",
    title: "Configuration",
    view: <Configuration />
  }
]
