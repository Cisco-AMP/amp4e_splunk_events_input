import { StyledErrorLink } from "./StyledCreateInput"

export const SERVER_ERROR_MESSAGE =
  "Input could not be saved due to server error"

export const CREATE_INPUT_ERROR_TITLE = <b>Input could not be saved:</b>

export const CREATE_INPUT_ERROR_IN_LOG =
  "Input could not be saved. Please see the logs."

export const INPUT_TOO_SMALL_ERROR = (
  <>
    <b>Input could not be saved:</b>
    <br />
    Input name cannot be empty or contain only whitespaces.
  </>
)

export const INPUT_TOO_BIG_ERROR = (
  <>
    <b>Input could not be saved:</b>
    <br />
    Input name must be less than 1024 characters.
  </>
)

export const INPUT_EXISTS_ERROR = (
  <>
    <b>Input could not be saved:</b>
    <br />
    Input with this name already exists.
  </>
)

export const EMPTY_CONFIG_ERROR = (
  <>
    {" "}
    It appears your configuration is incomplete, so you will not be able to
    create any inputs. Please update your{" "}
    <StyledErrorLink href="setup_amp4e_events_input_new">
      configuration
    </StyledErrorLink>
    .
  </>
)

export const WRONG_CONFIG_ERROR = (
  <>
    {" "}
    We couldn’t retrieve the information from API with provided credentials.
    Please make sure the API host is accessible or{" "}
    <StyledErrorLink href="setup_amp4e_events_input_new">
      re-configure
    </StyledErrorLink>{" "}
    the input with correct credentials.
  </>
)
