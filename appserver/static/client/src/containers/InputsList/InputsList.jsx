import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInputs, fetchStreams } from "./InputListSlice"
import {
  CREATE_NEW_INPUT,
  INPUTS_TABLE_HEADER,
  INPUTS_TABLE_ID,
  STREAMS_TABLE_HEADER,
  STREAMS_TABLE_ID,
  UNLINKED_STREAMS_ERROR_MESSAGE,
  UNLINKED_STREAMS_SUCCESS_MESSAGE
} from "./constants"
import {
  generateTable,
  getInputsTableBody,
  getStreamsTableBody,
  renderLoader
} from "./helpers"
import {
  CreateButtonWrapper,
  StreamsWrapper,
  TableWrapper
} from "./StyledInputList"
import Modal from "../../components/Modal"

const InputsList = () => {
  const dispatch = useDispatch()
  const { data: inputs, pending: inputsPending } = useSelector(
    (state) => state.inputsList.inputs
  )
  const { data: streams, pending: streamsPending } = useSelector(
    (state) => state.inputsList.streams
  )

  const [modalProps, setModalProps] = useState()

  const isPending = inputsPending || streamsPending

  useEffect(() => {
    dispatch(fetchInputs())
    dispatch(fetchStreams())
  }, [dispatch])

  return (
    <>
      <CreateButtonWrapper
        className="btn-group create-content new-input-button-group"
        id="createInputButton"
      >
        <a className="btn btn-primary" href="create_amp4e_events_input_new">
          {CREATE_NEW_INPUT}
        </a>
      </CreateButtonWrapper>

      {isPending ? (
        renderLoader()
      ) : (
        <>
          <TableWrapper>
            {inputs.length > 0 &&
              generateTable(
                INPUTS_TABLE_ID,
                INPUTS_TABLE_HEADER,
                getInputsTableBody(inputs, streams, dispatch, setModalProps)
              )}
          </TableWrapper>

          {streams.length > 0 && (
            <StreamsWrapper>
              <h2>Unlinked Event Streams</h2>

              <div className="alert alert-info">
                <i className="icon-alert" />
                <span id="success-text-unlinked-streams">
                  {UNLINKED_STREAMS_SUCCESS_MESSAGE}
                </span>
              </div>
              <div className="alert alert-error">
                <i className="icon-alert" />
                <span id="error-text-unlinked-streams">
                  <strong>{UNLINKED_STREAMS_ERROR_MESSAGE}</strong>
                </span>
              </div>

              <TableWrapper>
                {streams.length > 0 &&
                  generateTable(
                    STREAMS_TABLE_ID,
                    STREAMS_TABLE_HEADER,
                    getStreamsTableBody(streams, dispatch, setModalProps)
                  )}
              </TableWrapper>
            </StreamsWrapper>
          )}
          <Modal {...modalProps} />
        </>
      )}
    </>
  )
}

export default InputsList
