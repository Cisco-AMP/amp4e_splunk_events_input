import { navs } from "./constants"
import { Container } from "./StyledApp"

const App = () => {
  const pathname = window.location.pathname

  return <Container>{navs[pathname].view}</Container>
}

export default App
