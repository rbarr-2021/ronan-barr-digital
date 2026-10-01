import { useEffect } from "react"

function WebsiteDevelopment() {
  useEffect(() => {
    document.title =
      "Website Development Northern Ireland | Ronan Barr Digital"

    const description =
      "Website development for small businesses across Northern Ireland. Modern, responsive websites designed around real business needs."

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
            <a href="/software-development-northern-ireland">
              Software
            </a>
            <a href="/#work">Work</a>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="hero-section service-hero">
        <div className="container">
          <p className="eyebrow">Website Development · Northern Ireland</p>

          <h1>
            Website Development for Small Businesses in Northern Ireland
          </h1>

          <p className="hero-copy">
            Modern, responsive websites built around your business, your
            customers and the actions you actually want people to take.
          </p>

          <a className="primary-button" href="/#contact">
            Discuss Your Website
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <p className="eyebrow">Practical Website Development</p>

          <h2>
            More than simply putting a business online.
          </h2>

          <p>
            I build websites for small businesses across Northern Ireland,
            including County Down, Belfast, Newry, Downpatrick and surrounding
            areas.
          </p>

          <p>
            The focus is on creating a professional online presence that is
            fast, mobile-friendly, easy to use and designed around genuine
            business objectives.
          </p>

          <p>
            This can include new business websites, redesigning an existing
            site, improving customer journeys, integrating contact and booking
            options, and developing supporting digital tools where required.
          </p>
        </div>
      </section>

      <section className="section muted-section">
        <div className="container">
          <p className="eyebrow">Website Services</p>

          <div className="card-grid">
            <article className="card">
              <h3>New Business Websites</h3>
              <p>
                Modern websites designed around your business, services and
                customers.
              </p>
            </article>

            <article className="card">
              <h3>Website Redesign</h3>
              <p>
                Improve an outdated or ineffective site without unnecessary
                complexity.
              </p>
            </article>

            <article className="card">
              <h3>Mobile Responsive Design</h3>
              <p>
                Sites designed to work cleanly across phones, tablets and
                desktop screens.
              </p>
            </article>

            <article className="card">
              <h3>Business Integrations</h3>
              <p>
                Contact, booking, payments and other useful digital features
                where the business needs them.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <p className="eyebrow">Software & Systems</p>

          <h2>Need more than a website?</h2>

          <p>
            I also develop practical software and digital systems for businesses
            that need to simplify administration, workflows or operational
            processes.
          </p>

          <a
            className="text-link"
            href="/software-development-northern-ireland"
          >
            Explore software development
          </a>
        </div>
      </section>
    </main>
  )
}

export default WebsiteDevelopment
