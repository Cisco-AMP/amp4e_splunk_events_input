import { useSelector } from "react-redux"
import { MessagesContainer, MessageWrapper } from "./StyledMessages"
import { DANGER_MESSAGE_TYPE } from "./constants"

const Messages = () => {
  const { type, message, isShown } = useSelector((state) => state.messages)

  return isShown ? (
    <MessagesContainer>
      <MessageWrapper
        isDanger={type === DANGER_MESSAGE_TYPE}
        className={`alert alert-${type}`}
      >
        {type === DANGER_MESSAGE_TYPE ? (
          <strong>Warning!</strong>
        ) : (
          <i className="icon-alert"></i>
        )}
        <span className="message">{message}</span>
      </MessageWrapper>
    </MessagesContainer>
  ) : null
}

export default Messages
