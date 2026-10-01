export const RETREAT_WHATSAPP_NUMBER = "447591383215"

export function getRetreatWhatsAppUrl(message = "") {
  const normalizedMessage = String(message ?? "").trim()

  if (!normalizedMessage) {
    return `https://wa.me/${RETREAT_WHATSAPP_NUMBER}`
  }

  return `https://wa.me/${RETREAT_WHATSAPP_NUMBER}?text=${encodeURIComponent(normalizedMessage)}`
}
