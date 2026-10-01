import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import Seo from "./Seo"
import { useAuth } from "./useAuth"

const adminLinks = [
  { to: "/admin", label: "Dashboard", shortLabel: "Home", icon: "D", end: true },
  { to: "/admin/settings", label: "Business Settings", shortLabel: "Settings", icon: "S" },
  { to: "/admin/treatments", label: "Treatments", shortLabel: "Treatments", icon: "T" },
  { to: "/admin/availability", label: "Availability", shortLabel: "Calendar", icon: "A" },
  { to: "/admin/bookings", label: "Bookings", shortLabel: "Bookings", icon: "B" },
]

function AdminLayout() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileEditing, setIsMobileEditing] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut()
    navigate("/admin/login", { replace: true })
  }

  return (
    <>
      <Seo title="Admin | Retreat by the Mournes" description="Secure administrator area." path="/admin" robots="noindex, nofollow" />
      <section className={`admin-shell ${isMobileEditing ? "is-mobile-editing" : ""}`}>
        <div className="admin-shell__inner">
          <header className="admin-topbar">
            <div className="admin-topbar__content">
              <p className="admin-kicker">Secure Administrator Area</p>
              <h1 className="admin-title">Retreat by the Mournes Admin</h1>
              <p className="section-copy admin-subtitle">Signed in as {user?.email ?? "administrator"}.</p>
            </div>

            <div className="admin-topbar__actions">
              <button type="button" className="ghost-button admin-logout" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </header>

          <nav className="admin-nav admin-nav--desktop" aria-label="Administrator">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `admin-nav__link ${isActive ? "is-active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-content">
            <Outlet context={{ isMobileEditing, setIsMobileEditing }} />
          </div>
        </div>

        <nav className="admin-bottom-nav" aria-label="Administrator mobile navigation">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-bottom-nav__link ${isActive ? "is-active" : ""}`}
            >
              <span className="admin-bottom-nav__icon" aria-hidden="true">
                {link.icon}
              </span>
              <span className="admin-bottom-nav__label">{link.shortLabel}</span>
            </NavLink>
          ))}
        </nav>
      </section>
    </>
  )
}

export default AdminLayout
