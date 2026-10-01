import heroImg from "../assets/wellness-hero.jpg"
import "../styles/global.css"
import { Link } from "react-router-dom"

function Hero() {
  return (
    <section className="hero">
      <img src={heroImg} alt="" className="hero-bg" />

      <div className="hero-content">
        <h1 className="hero-title">Relax. Recover. Rebalance.</h1>
        <p className="hero-copy">Holistic therapy to restore balance and wellbeing.</p>
        <Link to="/treatments" className="cta-button">
          Begin Your Retreat
        </Link>
      </div>
    </section>
  )
}

export default Hero
