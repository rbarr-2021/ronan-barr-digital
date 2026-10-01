import { useState, useEffect } from "react"
import { FaHome, FaSpa, FaFacebook, FaInstagram, FaWhatsapp, FaUser } from "react-icons/fa"
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2"
import { Link } from "react-router-dom"
import logo from "../assets/logo.png"
import { getRetreatWhatsAppUrl } from "../lib/contact"

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const closeMenuOnScroll = () => {
      setMenuOpen(false)
    }

    window.addEventListener("scroll", closeMenuOnScroll)
    return () => window.removeEventListener("scroll", closeMenuOnScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Retreat by the Mournes home">
          <img src={logo} alt="Retreat By the Mournes" className="navbar-brand-logo" />
          <div className="navbar-brand-text">
            <div className="navbar-brand-title">RETREAT</div>
            <div className="navbar-brand-subtitle">by the Mournes</div>
          </div>
        </Link>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="navbar-toggle"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <HiOutlineAdjustmentsHorizontal size={24} color="var(--text-dark)" />
          </button>

          {menuOpen && (
            <div className="dropdown" role="menu" aria-label="Primary navigation">
              <Link to="/" className="menu-item" onClick={() => setMenuOpen(false)}>
                <FaHome /> Home
              </Link>

              <Link to="/treatments" className="menu-item" onClick={() => setMenuOpen(false)}>
                <FaSpa /> Services
              </Link>

              <a href={getRetreatWhatsAppUrl()} className="menu-item" onClick={() => setMenuOpen(false)}>
                <FaWhatsapp color="#25D366" /> Contact
              </a>

              <Link to="/about" className="menu-item" onClick={() => setMenuOpen(false)}>
                <FaUser /> About
              </Link>

              <hr style={{ border: 0, borderTop: "1px solid rgba(198, 166, 100, 0.22)", margin: "10px 0" }} />

              <a
                href="https://www.instagram.com/retreat_by_the_mournes?stkn=c3cyeWRleTQ4M3h0"
                className="menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <FaInstagram color="#c13584" /> Instagram
              </a>

              <a
                href="https://www.facebook.com/people/Holistic-Sports-Therapy-by-Beata/61581068248993/"
                className="menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <FaFacebook color="#1877f2" /> Facebook
              </a>

              <a href={getRetreatWhatsAppUrl()} className="menu-item" onClick={() => setMenuOpen(false)}>
                <FaWhatsapp color="#25D366" /> WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

