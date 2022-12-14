import Select from "react-select"
import styled from "styled-components"

export const StyledContainer = styled.div`
  background: #fff;
  padding: 10px;
`

export const StyledSelect = styled(Select)`
  width: 512px;

  input {
    box-shadow: none !important;
  }
`

export const StyledInput = styled.input`
  width: 512px;
  height: 36px !important;
`
