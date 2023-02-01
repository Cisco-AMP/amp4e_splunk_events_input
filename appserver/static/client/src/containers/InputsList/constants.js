import { locale } from "@splunk/splunk-utils/config"

export const CREATE_NEW_INPUT = "Create a New Input"

export const UNLINKED_STREAMS_SUCCESS_MESSAGE =
  "These event streams are not linked to any Splunk inputs but they still count towards your event streams limit."
export const UNLINKED_STREAMS_ERROR_MESSAGE =
  "Note that deleting the streams here will remove them from the AMP for Endpoints Server. Make sure other members of your team are not using them before deleting."

export const INPUTS_TABLE_HEADER = [
  "Name",
  "Index",
  "Stream Name",
  "Event Types",
  "Groups",
  "Actions"
]
export const STREAMS_TABLE_HEADER = ["Stream Name", "Actions"]

export const INPUTS_TABLE_ID = "inputs-table"
export const STREAMS_TABLE_ID = "unlinked-streams-table"

export const DELETED_INPUT_TOOLTIP =
  "This input is not linked to any AMP for Endpoints API event streams. You will not be able to receive any data from it."

export const MODEL_CANCEL_BUTTON = "Cancel"
export const MODEL_SUBMIT_BUTTON = "Yes, Delete"

export const STREAMS_DELETE_MODAL_TITLE = "Delete Event Stream"
export const STREAMS_DELETE_MODAL_BODY =
  "Are you sure you want to delete this event stream? This operation cannot be undone."

export const streamsDeleteModalVerbiage = {
  title: STREAMS_DELETE_MODAL_TITLE,
  body: STREAMS_DELETE_MODAL_BODY,
  cancel: MODEL_CANCEL_BUTTON,
  submit: MODEL_SUBMIT_BUTTON
}

export const INPUTS_DELETE_MODAL_TITLE = "Delete Input"
export const INPUTS_DELETE_MODAL_BODY =
  "Are you sure you want to delete this input? This operation cannot be undone."

export const inputsDeleteModalVerbiage = {
  title: INPUTS_DELETE_MODAL_TITLE,
  body: INPUTS_DELETE_MODAL_BODY,
  cancel: MODEL_CANCEL_BUTTON,
  submit: MODEL_SUBMIT_BUTTON
}

export const CONTROLLER_URL = `/${locale}/custom/amp4e_events_input/amp_streams_api_controller/`
