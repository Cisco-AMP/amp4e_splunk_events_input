import {
  DELETED_INPUT_TOOLTIP,
  inputsDeleteModalVerbiage,
  STREAMS_TABLE_ID,
  streamsDeleteModalVerbiage
} from "./constants"
import {
  ActionButton,
  LoaderWrapper,
  ProgressBar,
  TableHead,
  WarningIcon
} from "./StyledInputList"
import { hideModal, showModal } from "../../components/Modal/ModalSlice"
import { deleteInput, deleteStream } from "./InputListSlice"

export const generateTable = (id, headers, body) => (
  <table className="table table-striped display" id={id}>
    <thead>
      <tr role="row">
        {headers.map((header) => (
          <TableHead
            columnSpan={id === STREAMS_TABLE_ID && header === "Actions" && 8}
          >
            {header}
          </TableHead>
        ))}
      </tr>
    </thead>
    {body}
  </table>
)

export const getInputsTableBody = (
  inputs,
  streams,
  dispatch,
  setModalProps
) => (
  <tbody>
    {inputs.map(({ href, name, content, acl }, index) => (
      <tr key={index} data-input-name={name}>
        <td>
          {!streams.some(({ name }) => name === content.stream_name) && (
            <WarningIcon
              className="icon-alert"
              rel="tooltip"
              title={DELETED_INPUT_TOOLTIP}
            />
          )}
          <a href={href}>{name}</a>
        </td>
        <td>{content.index}</td>
        <td>{content.stream_name}</td>
        <td>{content.event_types_names}</td>
        <td>{content.groups_names}</td>
        <td>
          <ActionButton
            className="action-link delete-input"
            data-owner={acl.owner}
            data-namespace={acl.app}
            data-name={name}
            onClick={() => {
              dispatch(showModal(inputsDeleteModalVerbiage))
              setModalProps({
                submitFunction: () => {
                  dispatch(deleteInput({ name, acl, content }))
                  dispatch(hideModal())
                }
              })
            }}
          >
            Delete
          </ActionButton>
        </td>
      </tr>
    ))}
  </tbody>
)

export const getStreamsTableBody = (streams, dispatch, setModalProps) => (
  <tbody>
    {streams.map(({ name, id }) => (
      <tr data-stream-id={id}>
        <td>{name}</td>
        <td>
          <ActionButton
            className="action-link delete-stream"
            data-id={id}
            onClick={() => {
              dispatch(showModal(streamsDeleteModalVerbiage))
              setModalProps({
                submitFunction: () => {
                  dispatch(deleteStream({ id }))
                  dispatch(hideModal())
                }
              })
            }}
          >
            Delete
          </ActionButton>
        </td>
      </tr>
    ))}
  </tbody>
)

export const renderLoader = () => (
  <LoaderWrapper id="content">
    <div className="loading-placeholder">
      Retrieving inputs...
      <div className="progress">
        <ProgressBar className="bar" />
      </div>
    </div>
  </LoaderWrapper>
)
