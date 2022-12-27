import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { navs } from "./constants"
import { Container } from "./StyledApp"
import Messages from "./components/Messages"
import {
  fetchAPIKey,
  fetchConfig
} from "./containers/Configuration/ConfigurationSlice"
import {
  hideMessages,
  showDangerMessage
} from "./components/Messages/MessagesSlice"
import { EMPTY_CONFIG_ERROR } from "./containers/CreateInput/constants"

const App = () => {
  const dispatch = useDispatch()
  const {
    data: { apiId, apiKey, apiHost },
    pending
  } = useSelector((state) => state.configuration)

  const pathname = window.location.pathname

  useEffect(() => {
    !apiId && dispatch(fetchConfig())
    apiId && dispatch(fetchAPIKey(apiId))
  }, [dispatch, apiId])

  useEffect(() => {
    if (navs[pathname].id === "createInput") {
      dispatch(hideMessages())
      if (!pending && (!apiId || !apiKey || !apiHost)) {
        dispatch(showDangerMessage(EMPTY_CONFIG_ERROR))
      }
    }
  }, [apiHost, apiId, apiKey, dispatch, pathname, pending])

  return (
    <Container>
      <Messages />
      {apiKey && navs[pathname].view}
    </Container>
  )
}

export default App
