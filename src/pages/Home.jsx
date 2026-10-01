import { useState } from "react"

function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [formStatus, setFormStatus] = useState("idle")

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setFormStatus("sending")

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/rbarr1983@gmail.com",
        {
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error("Submission failed")
      }

      form.reset()
      setFormStatus("success")
    } catch {
      setFormStatus("error")
    }
  }
  return (
    <main className="digital-site">
      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#top">
  <span className="brand-mark" aria-hidden="true">
  <svg viewBox="0 0 40 40" className="brand-mark-svg">
    <path
      d="M10 9H20.5C25.5 9 28.5 11.7 28.5 16C28.5 19.2 26.8 21.2 24.1 22.1C27.5 22.9 29.5 25.3 29.5 28.8C29.5 33 26.4 35.5 21.2 35.5H10V9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M16 15V29"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M16 15H21.5C23.8 15 25 16 25 17.8C25 19.6 23.8 20.6 21.5 20.6H16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 20.6H22C24.7 20.6 26.2 21.9 26.2 24.1C26.2 26.4 24.7 27.8 22 27.8H16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</span>
  <span className="brand-text">
    <span className="brand-name">Ronan Barr</span>
    <span className="brand-sub">Digital</span>
  </span>
</a>

          <div className="nav-area">
  <nav className="nav-links desktop-nav" aria-label="Main navigation">
    <a href="#services">Services</a>
    <a href="/website-development-northern-ireland">Websites</a>
    <a href="/software-development-northern-ireland">Software</a>
    <a href="#work">Work</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
  </nav>

  <button
    className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
    type="button"
    aria-label="Toggle navigation"
    aria-expanded={menuOpen}
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <span></span>
    <span></span>
  </button>
</div>

<div className={`mobile-menu ${menuOpen ? "is-open" : ""}`}>
  <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
  <a href="/website-development-northern-ireland" onClick={() => setMenuOpen(false)}>Websites</a>
  <a href="/software-development-northern-ireland" onClick={() => setMenuOpen(false)}>Software</a>
  <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
  <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
  <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>

  <a
    className="mobile-menu-cta"
    href="#contact"
    onClick={() => setMenuOpen(false)}
  >
    Let's Talk
  </a>
</div>
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="container">
          <p className="eyebrow">Ronan Barr Digital</p>

          <h1>Practical Website & Software Development for Small Businesses in Northern Ireland</h1>

          <p className="hero-copy">
            Websites, workflow improvements and simple software tools designed
            to solve real business problems.
          </p>

          <a className="primary-button" href="#contact">
            Let&apos;s Talk
          </a>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <p className="eyebrow">How I Can Help</p>
          <h2>Useful digital support without the unnecessary complexity.</h2>

          <div className="card-grid">
            <article className="card">
              <h3>Websites & Improvements</h3>
              <p>
                New websites, refreshes, fixes and improvements designed around
                what your business and customers actually need.
              </p>
            </article>

            <article className="card">
              <h3>Business Systems</h3>
              <p>
                Simple digital tools that reduce admin, improve organisation and
                make everyday business tasks easier.
              </p>
            </article>

            <article className="card">
              <h3>Process Improvement</h3>
              <p>
                Identifying repetitive or inefficient processes and exploring
                practical ways to simplify them digitally.
              </p>
            </article>

            <article className="card">
              <h3>Digital Support</h3>
              <p>
                Practical help when you know something in your business could
                work better but you&apos;re not sure what the right solution is.
              </p>
            </article>
          </div>
        </div>
      </section>

            <section className="section muted-section" id="work">
        <div className="container">
          <p className="eyebrow">Selected Work</p>
          <h2>Projects built around real business problems.</h2>

          <div className="project-grid">

            <a
              className="project-card featured-project"
              href="https://nexhyr.co.uk/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="project-top">
                <span className="project-label">Hospitality Platform</span>
                <span className="external-icon" aria-hidden="true"></span>
              </div>

                            <h3>NexHyr</h3>

              <p>
                A hospitality staffing platform designed around the full shift
                journey - from worker and business onboarding through matching,
                payments and administration.
              </p>

              <span className="project-link">View project</span>
            </a>

            <a
              className="project-card"
              href="https://www.mourneretreat.co.uk/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="project-top">
                <span className="project-label">Website & Business Systems</span>
                <span className="external-icon" aria-hidden="true"></span>
              </div>

              <h3>Retreat by the Mournes</h3>

              <p>
                A modern website and supporting digital tools for an independent
                wellness and sports treatment business in County Down.
              </p>

              <span className="project-link">View project</span>
            </a>

            <article className="project-card">
              <div className="project-top">
                <span className="project-label">Custom Software</span>
              </div>

              <h3>Bespoke Business Tools</h3>

              <p>
                Small digital products created to simplify real operational
                problems, including audit tools, QR systems and internal web apps.
              </p>

              <span className="project-link project-link-muted">
                Built around individual business needs
              </span>
            </article>

          </div>
        </div>
      </section>

      <section className="section local-section" id="location">
        <div className="container narrow">
          <p className="eyebrow">County Down & Northern Ireland</p>

          <h2>Digital support for local businesses.</h2>

          <p>
            I work with small businesses across County Down and Northern Ireland,
            helping with website development, software development, business systems
            and practical digital improvements.
          </p>

          <p>
            Whether you are based in Newcastle, Downpatrick, Newry, Belfast or
            elsewhere in Northern Ireland, I can help you improve how your business
            works online and behind the scenes.
          </p>
        </div>
      </section>
      <section className="section" id="about">
        <div className="container narrow">
          <p className="eyebrow">About</p>

          <h2>Technology should make running a business easier.</h2>

          <p>
            I&apos;m Ronan Barr, a Northern Ireland-based software developer with
            an MSc in Software Development from Queen&apos;s University Belfast.
          </p>

          <p>
            My background also includes years working within hospitality and food
            businesses, so I understand the operational side of running a
            business as well as the technology.
          </p>

          <p>
            My approach is straightforward: understand the problem first, then
            use the simplest sensible digital solution to improve it.
          </p>
        </div>
      </section>

            <section className="section contact-section" id="contact">
  <div className="container contact-layout">

    <div className="contact-intro">
      <p className="eyebrow">Get In Touch</p>

      <h2>Have something in your business that could work better?</h2>

      <p>
        Tell me a little about what you need. Whether it's a website,
        software idea, manual process or digital problem, I'll come back
        to you to discuss the best way forward.
      </p>

      <div className="contact-direct">
        <a href="tel:+447809338779">
          <span className="contact-method-label">Call</span>
          <span>07809 338779</span>
        </a>

        <a
          href="https://wa.me/447809338779"
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-method-label">WhatsApp</span>
          <span>Message Ronan</span>
        </a>
      </div>
    </div>

    <form
      className="contact-form"
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        name="_subject"
        value="New Ronan Barr Digital enquiry"
      />

      <input
        type="hidden"
        name="_template"
        value="table"
      />
<input
        type="text"
        name="_honey"
        className="form-honeypot"
        tabIndex="-1"
        autoComplete="off"
      />

      <div className="form-row">
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            required
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@business.com"
            required
          />
        </label>
      </div>

      <label>
        <span>Business name</span>
        <input
          type="text"
          name="business"
          placeholder="Your business or organisation"
        />
      </label>

      <label>
        <span>What can I help with?</span>
        <select name="service" defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          <option value="Website development">
            Website development
          </option>
          <option value="Software development">
            Software development
          </option>
          <option value="Business systems">
            Business systems
          </option>
          <option value="Process improvement">
            Process improvement
          </option>
          <option value="Other digital support">
            Other digital support
          </option>
        </select>
      </label>

      <label>
        <span>Tell me about the project</span>
        <textarea
          name="message"
          rows="6"
          placeholder="What are you trying to improve, build or solve?"
          required
        ></textarea>
      </label>

      <button
        type="submit"
        className="contact-submit"
        disabled={formStatus === "sending"}
      >
        Send enquiry
        <span className="submit-arrow" aria-hidden="true">
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
</span>
      </button>

      {formStatus === "success" && (
        <div className="form-success" role="status">
          <strong>Message sent.</strong>
          <span>Thanks for getting in touch. I'll get back to you as soon as I can.</span>
        </div>
      )}

      {formStatus === "error" && (
        <div className="form-error" role="alert">
          Something went wrong. Please try again or contact me by WhatsApp.
        </div>
      )}

      <p className="form-note">
        Your enquiry will be sent directly to Ronan Barr Digital.
      </p>
    </form>

  </div>
</section>
    </main>
  )
}

export default Home










