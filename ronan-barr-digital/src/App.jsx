import Home from "./pages/Home"
import WebsiteDevelopment from "./pages/WebsiteDevelopment"
import SoftwareDevelopment from "./pages/SoftwareDevelopment"
import "./styles/site.css"

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"

  if (path === "/website-development-northern-ireland") {
    return <WebsiteDevelopment />
  }

  if (path === "/software-development-northern-ireland") {
    return <SoftwareDevelopment />
  }

  return <Home />
}

export default App
