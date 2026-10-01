import { useEffect } from "react"

function SoftwareDevelopment() {
  useEffect(() => {
    document.title =
      "Software Development Northern Ireland | Ronan Barr Digital"

    const description =
      "Practical software development and business systems for small businesses across Northern Ireland, including workflow tools and custom web applications."

    let meta = document.querySelector('meta[name="description"]')

    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }

    meta.content = description
  }, [])

  return (
    <main className="digital-site">
      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="/">
            <span className="brand-name">Ronan Barr</span>
            <span className="brand-sub">Digital</span>
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/website-development-northern-ireland">
              Websites
            </a>
            <a href="/#work">Work</a>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="hero-section service-hero">
        <div className="container">
          <p className="eyebrow">Software Development · Northern Ireland</p>

          <h1>
            Practical Software Development for Businesses in Northern Ireland
          </h1>

          <p className="hero-copy">
            Custom web applications, workflow tools and business systems
            designed to solve practical operational problems.
          </p>

          <a className="primary-button" href="/#contact">
            Discuss Your Idea
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <p className="eyebrow">Custom Software</p>

          <h2>
            Software built around the way your business actually works.
          </h2>

          <p>
            Many small businesses rely on spreadsheets, email, paperwork and
            repetitive manual processes because existing software does not quite
            fit what they need.
          </p>

          <p>
            I develop practical web-based systems that can simplify those
            processes, reduce administration and make information easier to
            manage.
          </p>

          <p>
            Projects can range from small internal tools through to larger web
            applications involving users, workflows, dashboards, payments and
            operational systems.
          </p>
        </div>
      </section>

      <section className="section muted-section">
        <div className="container">
          <p className="eyebrow">Software Services</p>

          <div className="card-grid">
            <article className="card">
              <h3>Business Systems</h3>
              <p>
                Web-based systems designed around specific business workflows.
              </p>
            </article>

            <article className="card">
              <h3>Workflow Automation</h3>
              <p>
                Reduce repetitive administration and improve how information
                moves through the business.
              </p>
            </article>

            <article className="card">
              <h3>Internal Tools</h3>
              <p>
                Practical dashboards, audit systems, operational tools and
                digital forms.
              </p>
            </article>

            <article className="card">
              <h3>Web Applications</h3>
              <p>
                Larger applications involving users, data, payments and
                business processes.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <p className="eyebrow">Website Development</p>

          <h2>Need a professional business website?</h2>

          <p>
            I also build modern websites for small businesses across Northern
            Ireland.
          </p>

          <a
            className="text-link"
            href="/website-development-northern-ireland"
          >
            Explore website development
          </a>
        </div>
      </section>
    </main>
  )
}

export default SoftwareDevelopment
