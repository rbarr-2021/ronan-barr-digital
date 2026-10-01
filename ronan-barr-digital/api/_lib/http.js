export function sendJson(response, statusCode, body) {
  response.status(statusCode).json(body)
}

export async function readRawBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks).toString("utf8")
}

export function getBaseUrlFromRequest(request) {
  const protocol = request.headers["x-forwarded-proto"] || "https"
  const host = request.headers["x-forwarded-host"] || request.headers.host

  return `${protocol}://${host}`
}
