import "../styles/global.css"
import { useEffect, useState } from "react"
import mapImg from "../assets/location2.PNG"
import { Link } from "react-router-dom"
import { DEFAULT_OPENING_HOURS, formatOpeningHoursList } from "../lib/businessSettings"
import { getBusinessSettings } from "../lib/supabase/database"

function Contact() {
  const [openingHours, setOpeningHours] = useState(formatOpeningHoursList(DEFAULT_OPENING_HOURS))

  useEffect(() => {
    const loadBusinessSettings = async () => {
      const { data } = await getBusinessSettings()

      if (data?.opening_hours) {
        setOpeningHours(formatOpeningHoursList(data.opening_hours))
      }
    }

    loadBusinessSettings()
  }, [])

  return (
    <section id="contact" className="site-section" style={{ background: "var(--bg-main)" }}>
      <div className="contact-card">
        <h2 className="section-subheading">Contact / Begin Your Retreat</h2>

        <div className="contact-hours section-copy">
          <h3 style={{ fontSize: "clamp(18px,2.5vw,22px)", margin: "0 0 10px", color: "var(--text-dark)" }}>
            Opening Hours
          </h3>
          {openingHours.map((item) => (
            <p key={item} style={{ margin: 0 }}>
              {item}
            </p>
          ))}
          <div style={{ marginTop: "14px" }}>
            <p style={{ margin: "0 0 6px", color: "var(--text-dark)", fontWeight: "500" }}>
              Can&apos;t see a time that works for you?
            </p>
            <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.75" }}>
              We understand that life can be busy. If our opening hours don&apos;t suit, please get in touch and
              we&apos;ll do our very best to arrange an appointment that fits your schedule.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: "1.7", color: "var(--text-light)" }}>
              Flexible appointment times may be available on request.
            </p>
          </div>
        </div>

        <div className="contact-details section-copy">
          <p style={{ margin: 0 }}>
            Email:{" "}
            <a href="mailto:beata@mourneretreat.co.uk?subject=Booking%20Enquiry&body=Hi%20Beata,%20I%20would%20like%20to%20book...">
              beata@mourneretreat.co.uk
            </a>
          </p>
          <p style={{ margin: 0 }}>
            Phone: <a href="tel:+447591383215">+447591 383215</a>
          </p>
        </div>

        <div style={{ marginTop: "22px" }}>
          <Link to="/treatments" className="cta-button">
            Begin Your Retreat
          </Link>
        </div>

        <div className="contact-location">
          <img src={mapImg} alt="Map showing the retreat location in Newcastle" className="contact-map" />
          <a
            href="https://maps.app.goo.gl/7unDaWEhynQcMBWE7"
            target="_blank"
            rel="noopener noreferrer"
            className="ghost-button"
            style={{ fontSize: "14px", padding: "12px 20px", width: "auto" }}
          >
            View Our Location
          </a>
          <span>8 Church Hill, Newcastle, BT33 0JU</span>
        </div>
      </div>
    </section>
  )
}

export default Contact
