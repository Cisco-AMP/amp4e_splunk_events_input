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
  options.map(
    ({ id, guid, name }) =>
      ids?.some(
        (selectedId) => Number(selectedId) === id || selectedId === guid
      ) && {
        value: id || guid,
        label: `${name} (${id || guid})`
      }
  )

export const parseIds = (ids) => ids?.split(",")

export const getNames = (options, selected) =>
  options
    .map(({ id, guid, name }) =>
      selected.some((el) => Number(el) === id || el === guid) ? name : null
    )
    .filter((el) => el)
    .join("---")

export const getSplunkHeader = () => ({
  "X-Requested-With": "XMLHttpRequest",
  "X-Splunk-Form-Key": document.cookie.match(
    /splunkweb_csrf_token_8000=(\d+)/
  )[1]
})

export const validateInput = (inputs, inputName, dispatch, isEdit) => {
  if (!inputName.length) {
    dispatch(showErrorMessage(INPUT_TOO_SMALL_ERROR))
  } else if (inputName.length >= 1024) {
    dispatch(showErrorMessage(INPUT_TOO_BIG_ERROR))
  } else if (!isEdit && inputs?.find(({ name }) => name === inputName)) {
    dispatch(showErrorMessage(INPUT_EXISTS_ERROR))
  } else {
    return true
  }
  return false
}
