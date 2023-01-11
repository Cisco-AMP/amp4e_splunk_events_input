import { useCallback, useEffect } from "react"
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

  const getPage = useCallback(
    () => navs?.find((nav) => pathname.includes(nav.path)),
    [pathname]
  )

  useEffect(() => {
    !apiId && dispatch(fetchConfig())
    apiId && dispatch(fetchAPIKey(apiId))
  }, [dispatch, apiId])

  useEffect(() => {
    if (getPage().id !== "configuration") {
      dispatch(hideMessages())
      if (!pending && (!apiId || !apiKey || !apiHost)) {
        dispatch(showDangerMessage(EMPTY_CONFIG_ERROR))
      }
    }
  }, [apiHost, apiId, apiKey, dispatch, getPage, pathname, pending])

  return (
    <Container>
      <Messages />
      {getPage().view}
    </Container>
  )
}

export default App
