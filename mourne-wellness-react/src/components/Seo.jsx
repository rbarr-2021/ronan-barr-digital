import { useEffect } from "react"

const BASE_URL = "https://www.mourneretreat.co.uk"
const DEFAULT_IMAGE = `${BASE_URL}/preview.jpg`
const SITE_NAME = "Retreat by the Mournes"

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement("meta")
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function ensureLink(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement("link")
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function Seo({
  title,
  description,
  path = "/",
  type = "website",
  image = DEFAULT_IMAGE,
  structuredData = [],
  robots = "index, follow",
}) {
  useEffect(() => {
    const canonical = `${BASE_URL}${path}`
    const socialTitle = title || SITE_NAME

    document.title = socialTitle
    document.documentElement.lang = "en-GB"

    ensureMeta('meta[name="description"]', { name: "description", content: description })
    ensureMeta('meta[name="robots"]', { name: "robots", content: robots })
    ensureMeta('meta[name="author"]', { name: "author", content: SITE_NAME })
    ensureMeta('meta[name="theme-color"]', { name: "theme-color", content: "#faf9f7" })
    ensureMeta('meta[name="application-name"]', { name: "application-name", content: SITE_NAME })
    ensureMeta('meta[name="apple-mobile-web-app-title"]', {
      name: "apple-mobile-web-app-title",
      content: SITE_NAME,
    })

    ensureLink('link[rel="canonical"]', { rel: "canonical", href: canonical })

    ensureMeta('meta[property="og:type"]', { property: "og:type", content: type })
    ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME })
    ensureMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_GB" })
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: socialTitle })
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description })
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonical })
    ensureMeta('meta[property="og:image"]', { property: "og:image", content: image })
    ensureMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: "Retreat by the Mournes preview image",
    })

    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" })
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: socialTitle })
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description })
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image })

    const existingScript = document.getElementById("structured-data")

    if (existingScript) {
      existingScript.remove()
    }

    if (structuredData.length > 0) {
      const script = document.createElement("script")
      script.id = "structured-data"
      script.type = "application/ld+json"
      script.text = JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData)
      document.head.appendChild(script)
    }
  }, [description, image, path, robots, structuredData, title, type])

  return null
}

export default Seo
