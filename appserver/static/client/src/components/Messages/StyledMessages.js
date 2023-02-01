import styled from "styled-components"

export const MessagesContainer = styled.div`
  padding: 10px;

  .alert {
    margin: 0;
  }
`

export const MessageWrapper = styled.div`
  color: ${(props) => props.isDanger && "#a94442"};
  background-color: ${(props) => props.isDanger && "#f2dede"};
  border-color: ${(props) => props.isDanger && "#ebccd1"};
`
