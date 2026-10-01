import "./WhatsAppButton.css"
import { FaWhatsapp } from "react-icons/fa"
import { useLocation } from "react-router-dom"
import { getRetreatWhatsAppUrl } from "../lib/contact"

function WhatsAppButton() {
  const location = useLocation()

  if (location.pathname === "/treatments") {
    return null
  }

  return (
    <a
      href={getRetreatWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp />
    </a>
  )
}

export default WhatsAppButton
