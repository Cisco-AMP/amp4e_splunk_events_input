import styled, { keyframes } from "styled-components"

const loading = keyframes`
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
`

export const Divider = styled.div`
  border-top: 1px solid #c3cbd4;
  margin-left: 5px;
  width: 96%;
`

export const CreateButtonWrapper = styled.div`
  margin: 5px 5px;
`

export const TableWrapper = styled.div`
  margin: 15px 5px;
  width: 96%;
`

export const StreamsWrapper = styled.div`
  margin: 10px -10px;
  padding: 10px 15px 0 15px;
  border-top: 20px solid #f1f4f5;
`

export const TableHead = styled.th`
  width: 20vw;
  column-gap: 50%;
`

export const ActionButton = styled.button`
  color: #006eaa;
  border: 0;
  background: none;
  :hover {
    text-decoration: underline;
  }
`

export const WarningIcon = styled.i`
  font-size: medium;
  color: #d6563c;
  margin-right: 5px;
`

export const LoaderWrapper = styled.div`
  margin: 5px;
`

export const ProgressBar = styled.div`
  width: 100%;
  animation: ${loading} 1s linear forwards;
`
