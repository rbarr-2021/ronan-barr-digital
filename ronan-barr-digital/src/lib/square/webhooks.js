import crypto from "node:crypto"
import { getSquareServerConfigValue } from "./client"
import { buildWebhookSignaturePayload, safeCompareSignatures } from "./helpers"

export function verifySquareWebhookSignature({ body, signature, notificationUrl }) {
  const signatureKey = getSquareServerConfigValue("webhookSignatureKey")

  if (!signatureKey) {
    throw new Error("Square webhook signature key is missing.")
  }

  if (!signature) {
    return false
  }

  const expected = crypto.createHmac("sha256", signatureKey).update(buildWebhookSignaturePayload(notificationUrl, body)).digest("base64")

  return safeCompareSignatures(expected, signature)
}

export function getWebhookNotificationUrl(request) {
  if (process.env.SQUARE_WEBHOOK_NOTIFICATION_URL) {
    return process.env.SQUARE_WEBHOOK_NOTIFICATION_URL
  }

  const protocol = request.headers["x-forwarded-proto"] || "https"
  const host = request.headers["x-forwarded-host"] || request.headers.host

  return `${protocol}://${host}${request.url}`
}
