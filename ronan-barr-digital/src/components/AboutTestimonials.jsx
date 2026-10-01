import "../styles/global.css"

function AboutTestimonials() {
  const testimonials = [
    {
      quote:
        "I've been going to Beata for over 16 years for deep tissue massages, and I honestly can't recommend her highly enough. She is so professional and welcoming and always makes me feel comfortable and relaxed at every appointment. What really stands out is her consistency and attention to detail. She takes the time to listen, and makes sure you leave feeling better every single time. After so many years, I can honestly say Beata is the best, and you won't find better.",
      author: "E. R., Newcastle",
    },
    {
      quote:
        "I have been going to Beata for 10 years now for her amazing sports massages. Her professionalism, knowledge and skill are incredible. I would highly recommend her as a massage therapist.",
      author: "P. H., Newcastle",
    },
    {
      quote:
        "Beata came to my rescue after a neural back and hamstring flare up when I was out running. She fitted me in so quickly and was able to pinpoint the areas of my body that were causing tension. The treatment not only eased my pain but also helped me relax mentally.",
      author: "Kerry, Dundrum",
    },
  ]

  return (
    <section className="site-section" style={{ background: "var(--bg-main)", color: "var(--text-dark)", textAlign: "center" }}>
      <div className="testimonials-intro" style={{ marginBottom: "60px" }}>
        <h2 className="section-heading">About Retreat By the Mournes</h2>
        <p className="section-copy" style={{ marginBottom: "15px" }}>
          Retreat By the Mournes is a sanctuary where mind, body, and nature harmonize. Nestled in the serene Mourne
          Mountains, every treatment is designed to restore balance and elevate wellbeing.
        </p>
        <p className="section-copy" style={{ margin: 0 }}>
          Our holistic approach blends bespoke therapies, mindful practices, and luxurious surroundings to create an
          experience of deep relaxation and rejuvenation.
        </p>
      </div>

      <div className="site-container">
        <h2 className="section-subheading">What Our Guests Say</h2>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.author} className="testimonial-card">
              <p
                className="section-copy"
                style={{
                  margin: 0,
                  fontStyle: "italic",
                  fontSize: "15px",
                }}
              >
                "{testimonial.quote}"
              </p>
              <p style={{ fontWeight: "600", margin: "12px 0 0", fontSize: "13px", color: "var(--text-dark)" }}>
                - {testimonial.author}
              </p>
            </article>
          ))}
        </div>

        <div style={{ marginTop: "28px" }}>
          <a
            href="https://share.google/SkuH2ggzHH72J7vJv"
            target="_blank"
            rel="noopener noreferrer"
            className="ghost-button"
            style={{ fontSize: "14px", padding: "12px 20px", width: "auto" }}
          >
            Read more reviews on Google
          </a>
        </div>
      </div>
    </section>
  )
}

export default AboutTestimonials
