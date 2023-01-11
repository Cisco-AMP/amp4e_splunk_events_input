import { showErrorMessage } from "../../components/Messages/MessagesSlice"
import {
  INPUT_EXISTS_ERROR,
  INPUT_TOO_BIG_ERROR,
  INPUT_TOO_SMALL_ERROR
} from "./constants"

export const createSelectOptions = (options, isIndex) =>
  options.map(({ id, guid, name }) => ({
    value: isIndex ? name : id || guid,
    label: isIndex ? name : `${name} (${id || guid})`
  }))

export const getSelectedOptions = (options, ids) =>
  options.map(({ id, guid, name }) => {
    console.log(
      ids.some((selectedId) => selectedId === id || selectedId === guid),
      id,
      guid
    )
    return (
      ids.some((selectedId) => selectedId === id || selectedId === guid) && {
        value: id || guid,
        label: `${name} (${id || guid})`
      }
    )
  })

export const getIds = (selected) => selected.map(({ value }) => value).join(",")

export const parseIds = (ids) => ids.split(",")

export const getNames = (selected) =>
  selected.map(({ label }) => label).join("---")

export const getSplunkHeader = () => ({
  "X-Requested-With": "XMLHttpRequest",
  "X-Splunk-Form-Key": document.cookie.match(
    /splunkweb_csrf_token_8000=(\d+)/
  )[1]
})

export const validateInput = (inputs, inputName, dispatch) => {
  if (!inputName.length) {
    dispatch(showErrorMessage(INPUT_TOO_SMALL_ERROR))
  } else if (inputName.length >= 1024) {
    dispatch(showErrorMessage(INPUT_TOO_BIG_ERROR))
  } else if (inputs.find(({ name }) => name === inputName)) {
    dispatch(showErrorMessage(INPUT_EXISTS_ERROR))
  } else {
    return true
  }
  return false
}
