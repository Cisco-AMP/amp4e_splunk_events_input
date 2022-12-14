import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchEventTypes,
  fetchGroups,
  fetchIndexes,
  saveWithAPI
} from "./CreateInputSlice"
import { StyledContainer, StyledInput, StyledSelect } from "./StyledCreateInput"
import { createSelectOptions, getIds, getNames } from "./helpers"

const CreateInput = () => {
  const dispatch = useDispatch()

  const { data: indexes, pending: indexesPending } = useSelector(
    (state) => state.createInput.indexes
  )
  const { data: eventTypes, pending: eventTypesPending } = useSelector(
    (state) => state.createInput.eventTypes
  )
  const { data: groups, pending: groupsPending } = useSelector(
    (state) => state.createInput.groups
  )
  const inputIsSaving = useSelector((state) => state.createInput.pending)

  const formIsPending = groupsPending || eventTypesPending || indexesPending

  const [inputName, setInputName] = useState("")
  const [selectedIndex, setSelectedIndex] = useState({ value: "main" })
  const [streamName, setStreamName] = useState("")
  const [selectedEventTypes, setSelectedEventTypes] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])

  useEffect(() => {
    dispatch(fetchIndexes())
    dispatch(fetchEventTypes())
    dispatch(fetchGroups())
  }, [dispatch])

  const handleSaveBtnClick = (e) => {
    e.stopPropagation()

    dispatch(
      saveWithAPI({
        name: inputName,
        index: selectedIndex.value,
        stream_name: streamName,
        event_types: getIds(selectedEventTypes),
        groups: getIds(selectedGroups),
        event_types_names: getNames(selectedEventTypes),
        groups_names: getNames(selectedGroups)
      })
    )
  }

  return (
    <StyledContainer>
      <div className="control-group input_name">
        <label className="control-label">
          Name
          <span className="required">*</span>
        </label>
        <div className="controls">
          <StyledInput
            type="text"
            name="name"
            onChange={(e) => setInputName(e.target.value)}
            disabled={formIsPending}
          />
          <span className="help-inline"></span>
        </div>
      </div>

      <div className="control-group input_index">
        <label className="control-label">Index</label>
        <div className="controls">
          <StyledSelect
            id="splunkIndexes"
            name="index"
            isDisabled={formIsPending}
            onChange={(value) => setSelectedIndex(value)}
            options={createSelectOptions(indexes, true)}
            defaultValue={{ option: "main", label: "main" }}
          />
          <span className="help-block">
            In which index would you like the events to appear?
          </span>
        </div>
      </div>

      <fieldset>
        <legend>Stream Settings</legend>

        <div className="control-group stream_name">
          <label className="control-label">
            Stream Name
            <span className="required">*</span>
          </label>
          <div className="controls">
            <StyledInput
              type="text"
              name="stream_name"
              disabled={formIsPending}
              onChange={(e) => setStreamName(e.target.value)}
            />
            <span className="help-inline"></span>
          </div>
        </div>

        <div className="control-group stream_event_types">
          <label className="control-label">Event Types</label>
          <StyledSelect
            autosize
            isMulti
            name="event_types"
            components={{
              DropdownIndicator: () => null,
              IndicatorsContainer: () => null
            }}
            isDisabled={formIsPending}
            onChange={(value) => setSelectedEventTypes(value)}
            placeholder="Leave this field blank to return all Event types"
            options={createSelectOptions(eventTypes)}
          />
          <span className="help-inline"></span>
        </div>

        <div className="control-group stream_groups">
          <label className="control-label">Groups</label>
          <div className="controls">
            <StyledSelect
              autosize
              isMulti
              name="groups"
              components={{
                DropdownIndicator: () => null,
                IndicatorsContainer: () => null
              }}
              isDisabled={formIsPending}
              onChange={(value) => setSelectedGroups(value)}
              placeholder="Leave this field blank to return all Groups"
              options={createSelectOptions(groups)}
            />
            <span className="help-inline"></span>
          </div>
        </div>
      </fieldset>

      <button
        className="btn btn-primary"
        id="save-changes"
        disabled={formIsPending}
        onClick={handleSaveBtnClick}
      >
        Save
      </button>
      {inputIsSaving && (
        <span className="saving">
          Please wait while we setup the AMP for Endpoints streaming resource...
        </span>
      )}
    </StyledContainer>
  )
}

export default CreateInput
