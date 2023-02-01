import { useDispatch, useSelector } from "react-redux"
import { hideModal } from "./ModalSlice"

const Modal = ({ submitFunction, cancelFunction }) => {
  const dispatch = useDispatch()
  const {
    verbiage: { title, body, cancel, submit },
    isShown
  } = useSelector((state) => state.modal)

  const handleHideModal = () => {
    dispatch(hideModal())
  }

  return (
    <>
      <div
        tabIndex="-1"
        id="delete-stream-modal"
        className={`modal fade in ${!isShown && "hide"}`}
      >
        <div className="modal-header">
          <button
            type="button"
            className="close btn-dialog-close"
            data-dismiss="modal"
            onClick={handleHideModal}
          >
            x
          </button>
          <h3 className="text-dialog-title">{title}</h3>
        </div>
        <div className="modal-body form form-horizontal modal-body-scrolling">
          {body}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-dialog-cancel pull-left"
            data-dismiss="modal"
            onClick={() => {
              cancelFunction && cancelFunction()
              handleHideModal()
            }}
          >
            {cancel}
          </button>
          <button
            className="btn btn-danger"
            id="delete-this-stream"
            data-dismiss="modal"
            onClick={() => submitFunction()}
          >
            {submit}
          </button>
        </div>
      </div>
      {isShown && <div className={`modal-backdrop fade in`} />}
    </>
  )
}

export default Modal
