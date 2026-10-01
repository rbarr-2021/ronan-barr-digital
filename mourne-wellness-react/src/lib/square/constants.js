export const SQUARE_PAYMENT_PROVIDER = "SQUARE"
export const SQUARE_DEFAULT_CURRENCY = "GBP"
export const SQUARE_DEFAULT_EXPIRY_HOURS = 24
export const SQUARE_API_VERSION = process.env.SQUARE_API_VERSION || "2024-06-04"

export const SQUARE_EVENT_TYPES = {
  PAYMENT_CREATED: "payment.created",
  PAYMENT_UPDATED: "payment.updated",
  PAYMENT_LINK_UPDATED: "online_checkout.payment_link.updated",
}
