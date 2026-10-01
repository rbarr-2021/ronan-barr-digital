import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa"
import logo from "../assets/logo.png"
import "../styles/global.css"
import { getRetreatWhatsAppUrl } from "../lib/contact"

function Footer() {
  return (
    <footer className="site-footer">
      <img src={logo} alt="Retreat By the Mournes" className="footer-logo" />

      <div style={{ fontSize: "15px", marginBottom: "2px" }}>
        <strong>RETREAT</strong>
      </div>
      <div style={{ fontSize: "12px", marginBottom: "10px", opacity: 0.8 }}>by the Mournes</div>

      <div className="section-copy" style={{ fontSize: "14px" }}>
        <p style={{ margin: "4px 0" }}>
          Email: <a href="mailto:beata@mourneretreat.co.uk">beata@mourneretreat.co.uk</a>
        </p>
        <p style={{ margin: "4px 0" }}>
          Phone: <a href="tel:+447591383215">+447591 383215</a>
        </p>
      </div>

      <div className="footer-socials">
        <a href="https://www.instagram.com/retreat_by_the_mournes?stkn=c3cyeWRleTQ4M3h0" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <FaInstagram size={20} color="#c13584" />
        </a>
        <a
          href="https://www.facebook.com/people/Holistic-Sports-Therapy-by-Beata/61581068248993/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook size={20} color="#1877f2" />
        </a>
        <a href={getRetreatWhatsAppUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <FaWhatsapp size={20} color="#25D366" />
        </a>
      </div>

      <p className="section-copy" style={{ marginTop: "15px", fontSize: "11px" }}>
        &copy; {new Date().getFullYear()} Retreat By the Mournes. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer


