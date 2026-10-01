import { SQUARE_API_VERSION } from "./constants"
import { getSquareBaseUrl } from "./helpers"

function getSquareServerConfig() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const locationId = process.env.SQUARE_LOCATION_ID
  const environment = process.env.SQUARE_ENVIRONMENT || "sandbox"
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY

  if (!accessToken || !locationId) {
    throw new Error("Square server credentials are missing.")
  }

  return {
    accessToken,
    locationId,
    environment,
    webhookSignatureKey,
    apiVersion: SQUARE_API_VERSION,
  }
}

export async function squareRequest(path, { method = "GET", body } = {}) {
  const config = getSquareServerConfig()
  const response = await fetch(`${getSquareBaseUrl(config.environment)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": config.apiVersion,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const squareMessage = Array.isArray(data?.errors) ? data.errors.map((entry) => entry.detail || entry.code).filter(Boolean).join(" ") : ""
    throw new Error(squareMessage || "Square could not process this request.")
  }

  return data
}

export function getSquareServerConfigValue(key) {
  return getSquareServerConfig()[key]
}
