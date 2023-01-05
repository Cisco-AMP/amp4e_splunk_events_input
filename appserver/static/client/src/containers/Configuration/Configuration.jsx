import { useDispatch, useSelector } from "react-redux"
import { Field, Form, Formik } from "formik"

import {
  StyledContainer,
  StyledErrorMessage,
  StyledFieldContainer,
  StyledHelpBlock
} from "./StyledConfiguration"
import {
  API_HOST_HELP,
  API_HOST_LABEL,
  API_ID_HELP,
  API_ID_LABEL,
  API_KEY_HELP,
  API_KEY_LABEL,
  CONFIG_SAVE_ERROR,
  CONFIGURATION_LEGEND,
  SAVE_BUTTON
} from "./constants"
import { createInitialValues, handleValidate } from "./helpers"
import { showErrorMessage } from "../../components/Messages/MessagesSlice"
import { saveAPIKey, saveConfig } from "./ConfigurationSlice"

const Configuration = () => {
  const dispatch = useDispatch()
  const { data: config, pending } = useSelector((state) => state.configuration)

  const handleSubmitConfig = (values, { setSubmitting }) => {
    if (Object.values(values).some((el) => el === "")) {
      dispatch(showErrorMessage(CONFIG_SAVE_ERROR))
    } else {
      dispatch(saveAPIKey(values))
      dispatch(
        saveConfig({ ...config, apiId: values.apiId, apiHost: values.apiHost })
      )
    }

    setSubmitting(false)
  }

  return (
    <StyledContainer>
      <legend>{CONFIGURATION_LEGEND}</legend>
      {!pending && (
        <Formik
          initialValues={createInitialValues(config)}
          validate={handleValidate}
          onSubmit={handleSubmitConfig}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <StyledFieldContainer isError={errors.apiHost && touched.apiHost}>
                <label className="control-label">
                  {API_HOST_LABEL}
                  <span className="required">*</span>
                </label>
                <Field
                  type="text"
                  name="apiHost"
                  placeholder="api.amp.cisco.com"
                />
                <StyledErrorMessage name="apiHost" component="div" />
                <StyledHelpBlock>{API_HOST_HELP}</StyledHelpBlock>
              </StyledFieldContainer>
              <StyledFieldContainer isError={errors.apiId && touched.apiId}>
                <label className="control-label">
                  {API_ID_LABEL}
                  <span className="required">*</span>
                </label>
                <Field type="text" name="apiId" />
                <span className="help-inline">
                  <StyledErrorMessage name="apiId" component="div" />
                </span>
                <StyledHelpBlock>{API_ID_HELP}</StyledHelpBlock>
              </StyledFieldContainer>
              <StyledFieldContainer isError={errors.apiKey && touched.apiKey}>
                <label className="control-label">
                  {API_KEY_LABEL}
                  <span className="required">*</span>
                </label>
                <Field type="password" name="apiKey" />
                <span className="help-inline">
                  <StyledErrorMessage name="apiKey" component="div" />
                </span>
                <StyledHelpBlock>{API_KEY_HELP}</StyledHelpBlock>
              </StyledFieldContainer>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {SAVE_BUTTON}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </StyledContainer>
  )
}

export default Configuration
