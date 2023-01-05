import { locale } from "@splunk/splunk-utils/config"

import InputsList from "./containers/InputsList"
import CreateInput from "./containers/CreateInput"
import Configuration from "./containers/Configuration"

export const navs = {
  [`/${locale}/app/amp4e_events_input/amp4e_events_input_list_new`]: {
    id: "inputsList",
    title: "Inputs",
    view: <InputsList />
  },
  [`/${locale}/app/amp4e_events_input/create_amp4e_events_input_new`]: {
    id: "createInput",
    title: "New Input",
    view: <CreateInput />
  },
  [`/${locale}/app/amp4e_events_input/setup_amp4e_events_input_new`]: {
    id: "configuration",
    title: "Configuration",
    view: <Configuration />
  }
}
