function Home() {
  return (
    <main className="digital-site">
      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#top">
            Ronan Barr Digital
          </a>

          <nav className="nav-links" aria-label="Main navigation">
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="container">
          <p className="eyebrow">Ronan Barr Digital</p>

          <h1>Practical digital solutions for small businesses.</h1>

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
          <p className="eyebrow">Recent Work</p>
          <h2>Digital projects built around practical business needs.</h2>

          <div className="work-list">
            <article className="work-item">
              <h3>NexHyr</h3>
              <p>
                Development of a hospitality staffing platform covering worker
                and business onboarding, shift management, payments,
                administration and operational workflows.
              </p>
            </article>

            <article className="work-item">
              <h3>Retreat by the Mournes</h3>
              <p>
                Website and digital support for a growing wellness and sports
                treatment business, focused on creating a professional online
                presence and supporting business operations.
              </p>
            </article>

            <article className="work-item">
              <h3>Bespoke Business Tools</h3>
              <p>
                Practical tools and prototypes including audit systems,
                QR-based applications and internal operational web applications.
              </p>
            </article>
          </div>
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
        <div className="container narrow">
          <p className="eyebrow">Get In Touch</p>

          <h2>Have something in your business that could work better?</h2>

          <p>
            Whether it&apos;s a website, a manual process, an admin headache or
            an idea you&apos;d like to explore, get in touch and we can talk
            through the options.
          </p>

          <div className="contact-actions">
            <a
              className="primary-button"
              href="mailto:rbarr1983@gmail.com"
            >
              Email Ronan
            </a>

            <a
              className="secondary-button"
              href="tel:+447809338779"
            >
              Call 07809 338779
            </a>

            <a
              className="whatsapp-button"
              href="https://wa.me/447809338779"
              target="_blank"
              rel="noreferrer"
              aria-label="Message Ronan on WhatsApp"
            >
              <svg
                className="whatsapp-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M20.52 3.48A11.87 11.87 0 0 0 12.07 0C5.49 0 .14 5.35.14 11.93c0 2.1.55 4.15 1.6 5.96L.04 24l6.29-1.65a11.9 11.9 0 0 0 5.73 1.46h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.48-8.4ZM12.07 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.45-9.91 9.92-9.91a9.84 9.84 0 0 1 7.01 2.91 9.84 9.84 0 0 1 2.9 7.01c-.01 5.47-4.46 9.92-9.94 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.62.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
                />
              </svg>
              <span>WhatsApp Ronan</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home





