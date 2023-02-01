import styled from "styled-components"
import { ErrorMessage } from "formik"

export const StyledContainer = styled.div`
  margin: 10px;
`

export const StyledFieldContainer = styled.div`
  color: ${(props) => props.isError && "#dc4e41 !important"};

  input {
    border: ${(props) => props.isError && "1px solid #dc4e41"};
  }
`

export const StyledHelpBlock = styled.span`
  display: block;
  margin-top: 3px;
  margin-bottom: 10px;
  line-height: 1.4em;
  font-size: 12px;
  word-wrap: break-word;
`

export const StyledErrorMessage = styled(ErrorMessage)`
  color: #dc4e41;
  display: inline-block;
  vertical-align: super;
  padding-left: 5px;
`
