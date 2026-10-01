import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
