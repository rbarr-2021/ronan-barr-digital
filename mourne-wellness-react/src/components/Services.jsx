import { Link } from "react-router-dom"
import { FaSpa } from "react-icons/fa"
import { GiHealing } from "react-icons/gi"
import { MdSelfImprovement } from "react-icons/md"
import "../styles/global.css"

function Services() {
  const cards = [
    {
      to: "/treatments",
      state: { targetCategory: "Signature Experiences" },
      icon: <FaSpa size={40} color="var(--primary)" />,
      title: "Signature Experiences",
      copy:
        "A collection of bespoke treatments designed to deeply relax the body, release built-up tension, and restore your natural balance.",
    },
    {
      to: "/treatments",
      state: { targetCategory: "Specialist Recovery" },
      icon: <GiHealing size={40} color="var(--primary)" />,
      title: "Specialist Recovery",
      copy:
        "Focused treatments to accelerate recovery, relieve muscle tension, and support the body's natural healing.",
    },
    {
      to: "/treatments",
      state: { targetCategory: "Signature Treatment" },
      icon: <MdSelfImprovement size={40} color="var(--primary)" />,
      title: "Signature Treatment",
      copy: "Mourne Recovery Therapy - A tailored blend of sports massage and myofascial release.",
    },
    {
      to: "/treatments",
      state: { targetCategory: "Express Rituals" },
      icon: <FaSpa size={40} color="var(--primary)" />,
      title: "Express Rituals - 30 Minutes",
      copy: "Short, focused treatments designed to quickly relieve tension, refresh the body, and restore calm.",
    },
  ]

  return (
    <section id="services" className="site-section">
      <div className="site-container" style={{ textAlign: "center" }}>
        <h2 className="section-subheading">Retreat By The Mournes</h2>
        <p className="section-copy" style={{ maxWidth: "500px", margin: "0 auto 40px" }}>
          Wellness & Sports Therapy | Restore balance | Reconnect with nature | Return to yourself
        </p>

        <div className="services-grid">
          {cards.map((card) => (
            <Link key={card.title} to={card.to} state={card.state} className="services-card">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>{card.icon}</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(18px,2vw,22px)", margin: "0 0 12px" }}>
                {card.title}
              </h3>
              <p className="section-copy" style={{ margin: 0, fontSize: "14px" }}>
                {card.copy}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
