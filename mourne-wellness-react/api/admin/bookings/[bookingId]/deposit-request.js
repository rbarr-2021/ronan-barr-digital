import { createDepositRequestForBooking } from "../../../../src/lib/booking-service/payments.js"
import { requireAuthenticatedAdmin } from "../../../_lib/auth.js"
import { getBaseUrlFromRequest, sendJson } from "../../../_lib/http.js"

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed." })
  }

  try {
    await requireAuthenticatedAdmin(request)

    const bookingId = request.query.bookingId
    const replaceExisting = Boolean(request.body?.replaceExisting)
    const booking = await createDepositRequestForBooking({
      bookingId,
      replaceExisting,
      baseUrl: getBaseUrlFromRequest(request),
    })

    return sendJson(response, 200, { booking })
  } catch (error) {
    return sendJson(response, 400, {
      error: error.message || "Could not create a payment link.",
    })
  }
}
