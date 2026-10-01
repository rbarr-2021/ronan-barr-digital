import { useEffect, useMemo, useState } from "react"
import Hero from "../components/Hero"
import TrustSection from "../components/TrustSection"
import Services from "../components/Services"
import Contact from "../components/Contact"
import WhatsAppButton from "../components/WhatsAppButton"
import AboutTestimonials from "../components/AboutTestimonials"
import Seo from "../components/Seo"
import { buildOpeningHoursSpecification, DEFAULT_OPENING_HOURS } from "../lib/businessSettings"
import { getBusinessSettings } from "../lib/supabase/database"

function Home() {
  const [openingHours, setOpeningHours] = useState(DEFAULT_OPENING_HOURS)

  useEffect(() => {
    const loadBusinessSettings = async () => {
      const { data } = await getBusinessSettings()

      if (data?.opening_hours) {
        setOpeningHours(data.opening_hours)
      }
    }

    loadBusinessSettings()
  }, [])

  const homeStructuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Retreat by the Mournes",
        url: "https://www.mourneretreat.co.uk/",
      },
      {
        "@context": "https://schema.org",
        "@type": "HealthAndBeautyBusiness",
        name: "Retreat by the Mournes",
        image: "https://www.mourneretreat.co.uk/preview.jpg",
        url: "https://www.mourneretreat.co.uk/",
        telephone: "+44 7591 383215",
        email: "beata@mourneretreat.co.uk",
        priceRange: "GBP",
        address: {
          "@type": "PostalAddress",
          streetAddress: "8 Church Hill",
          addressLocality: "Newcastle",
          addressRegion: "County Down",
          postalCode: "BT33 0JU",
          addressCountry: "GB",
        },
        areaServed: "Northern Ireland",
        sameAs: [
          "https://www.instagram.com/retreat_by_the_mournes?stkn=c3cyeWRleTQ4M3h0",
          "https://www.facebook.com/people/Holistic-Sports-Therapy-by-Beata/61581068248993/",
        ],
        openingHoursSpecification: buildOpeningHoursSpecification(openingHours),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Retreat by the Mournes | Boutique Wellness & Massage in Newcastle, Co. Down",
        url: "https://www.mourneretreat.co.uk/",
        description:
          "Retreat by the Mournes offers premium massage, sports therapy, facials and restorative wellness treatments in Newcastle, County Down beneath the Mourne Mountains.",
      },
    ],
    [openingHours]
  )

  return (
    <>
      <Seo
        title="Retreat by the Mournes | Boutique Wellness & Massage in Newcastle, Co. Down"
        description="Retreat by the Mournes offers premium massage, sports therapy, facials and restorative wellness treatments in Newcastle, County Down beneath the Mourne Mountains."
        path="/"
        structuredData={homeStructuredData}
      />
      <Hero />
      <TrustSection />
      <Services />
      <AboutTestimonials />
      <Contact />
      <WhatsAppButton />
    </>
  )
}

export default Home

