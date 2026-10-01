import crypto from "node:crypto"
import { SQUARE_DEFAULT_CURRENCY, SQUARE_DEFAULT_EXPIRY_HOURS } from "./constants"

export function getSquareBaseUrl(environment = process.env.SQUARE_ENVIRONMENT) {
  return environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com"
}

export function createSquareIdempotencyKey(prefix = "square") {
  return `${prefix}-${crypto.randomUUID()}`
}

export function toSquareAmount(amount) {
  return Math.round(Number(amount ?? 0) * 100)
}

export function fromSquareAmount(amount) {
  return Number(amount ?? 0) / 100
}

export function getSquareCurrency(currency = SQUARE_DEFAULT_CURRENCY) {
  return currency || SQUARE_DEFAULT_CURRENCY
}

export function getDepositExpiryDate(hours = SQUARE_DEFAULT_EXPIRY_HOURS, now = new Date()) {
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

export function generatePaymentReference(bookingId) {
  return `RBTM-${String(bookingId).slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`
}

export function buildWebhookSignaturePayload(notificationUrl, body) {
  return `${notificationUrl}${body}`
}

export function safeCompareSignatures(left, right) {
  const leftBuffer = Buffer.from(left || "", "utf8")
  const rightBuffer = Buffer.from(right || "", "utf8")

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}
