import { Link } from "react-router-dom"
import { LuBadgeCheck, LuLeaf, LuShieldCheck, LuUserRoundCheck } from "react-icons/lu"

const trustItems = [
  {
    icon: <LuBadgeCheck size={20} strokeWidth={1.75} />,
    text: "Proud member of the Federation of Holistic Therapists (FHT)",
  },
  {
    icon: <LuShieldCheck size={20} strokeWidth={1.75} />,
    text: "Fully insured",
  },
  {
    icon: <LuLeaf size={20} strokeWidth={1.75} />,
    text: "Using Neal's Yard Remedies Organic products",
  },
  {
    icon: <LuUserRoundCheck size={20} strokeWidth={1.75} />,
    text: "Every treatment tailored to your individual needs",
  },
]

function TrustSection() {
  return (
    <section className="trust-section site-section" aria-labelledby="trust-section-title">
      <div className="site-container trust-section__container">
        <div className="trust-section__intro">
          <h2 id="trust-section-title" className="section-subheading trust-section__title">
            Trusted Professional Care
          </h2>
          <p className="section-copy trust-section__lead">
            Over 20 years of professional experience, personalised one-to-one treatments and a commitment to
            exceptional client care.
          </p>
        </div>

        <div className="trust-section__items" role="list" aria-label="Professional trust points">
          {trustItems.map(({ icon, text }) => (
            <div key={text} className="trust-section__item" role="listitem">
              <span className="trust-section__icon" aria-hidden="true">{icon}</span>
              <p className="trust-section__item-text">{text}</p>
            </div>
          ))}
        </div>

        <p className="section-copy trust-section__supporting-copy">
          Every treatment is thoughtfully tailored to your individual needs, ensuring you receive the care,
          attention and experience that's right for you.
        </p>

        <div className="trust-section__actions">
          <Link to="/treatments" className="cta-button">
            Discover Our Treatments
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TrustSection
