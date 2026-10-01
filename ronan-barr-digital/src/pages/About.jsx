import { FaSpa } from "react-icons/fa"
import { GiHealing } from "react-icons/gi"
import { MdSelfImprovement } from "react-icons/md"
import "../styles/global.css"
import hero from "../assets/hero.jpg"
import profile from "../assets/profile.jpeg"
import { Link } from "react-router-dom"
import Seo from "../components/Seo"
import WhatsAppButton from "../components/WhatsAppButton"

const aboutStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Beata | Retreat by the Mournes",
    url: "https://www.mourneretreat.co.uk/about",
    description:
      "Meet Beata and discover over 20 years of experience helping clients restore body and mind through expert therapeutic treatments.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Beata",
    worksFor: {
      "@type": "HealthAndBeautyBusiness",
      name: "Retreat by the Mournes",
    },
    jobTitle: "Massage and Wellness Therapist",
    description:
      "Beata brings over 20 years of experience in therapeutic treatments focused on restoring balance, easing tension and supporting wellbeing.",
  },
]

function About() {
  const cards = [
    {
      icon: <FaSpa size={40} color="var(--primary)" />,
      title: "My Story - About Beata",
      copy:
        "My journey into holistic therapy began over 20 years ago, driven by a passion for helping people feel better in both body and mind. Over the years, I've worked with a wide range of clients, continually developing my skills and refining my approach.",
    },
    {
      icon: <GiHealing size={40} color="var(--primary)" />,
      title: "My Approach",
      copy:
        "Every session is guided by listening and understanding, creating a treatment that feels completely tailored to you.",
    },
  ]

  return (
    <div className="about-page">
      <Seo
        title="About Beata | Retreat by the Mournes"
        description="Meet Beata and discover over 20 years of experience helping clients restore body and mind through expert therapeutic treatments."
        path="/about"
        structuredData={aboutStructuredData}
      />
      <div className="about-hero">
        <img src={hero} alt="Mourne landscape" />
      </div>

      <div className="about-intro">
        <h1 className="section-heading">About Beata & Retreat by the Mournes</h1>

        <p className="section-copy">
          Inspired by the mountains and the sea, my work is rooted in balance, flow, and quiet restoration. Each
          treatment is designed to create a sense of calm - a space to slow down, reset, and reconnect.
        </p>
        <p className="section-copy">
          Blending over 20 years of clinical experience with an intuitive, restorative touch, every session is tailored
          to ease tension, restore lightness, and bring the body back into balance.
        </p>
        <p className="section-copy">
          Whether you are managing physical strain, navigating change, or simply seeking time to pause, treatments are
          shaped around you - leaving you feeling calmer, lighter, and deeply restored.
        </p>
        <p className="section-copy">
          Raised in the Polish mountains and now based in County Down, nature remains at the heart of my approach -
          steady, flowing, and quietly transformative.
        </p>
      </div>

      <div className="about-portrait-wrap">
        <div className="about-portrait-frame">
          <img src={profile} alt="Portrait of Beata" className="about-portrait" />
        </div>
      </div>

      <div className="about-cards-section">
        <div className="site-container">
          <div className="about-cards">
            {cards.map((card) => (
              <article key={card.title} className="about-card">
                <div style={{ marginBottom: "12px" }}>{card.icon}</div>
                <h3 style={{ margin: "0 0 10px" }}>{card.title}</h3>
                <p className="section-copy" style={{ margin: 0, fontSize: "14px" }}>
                  {card.copy}
                </p>
              </article>
            ))}

            <Link to="/treatments" style={{ textDecoration: "none", display: "flex" }}>
              <article className="about-cta-card" style={{ width: "100%" }}>
                <div style={{ marginBottom: "12px" }}>
                  <MdSelfImprovement size={40} color="var(--primary)" />
                </div>
                <h3 style={{ margin: "0 0 10px" }}>Begin Your Retreat</h3>
                <p className="section-copy" style={{ margin: 0, fontSize: "14px" }}>
                  Take time for yourself and experience a moment of calm in the Mournes.
                </p>
                <div style={{ marginTop: "auto", paddingTop: "18px", width: "100%" }}>
                  <span className="cta-button" style={{ width: "100%" }}>
                    Book Now
                  </span>
                </div>
              </article>
            </Link>
          </div>
        </div>
      </div>

      <WhatsAppButton />
    </div>
  )
}

export default About
