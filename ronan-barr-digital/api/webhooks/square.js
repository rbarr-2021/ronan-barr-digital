import { confirmBookingDepositPaid } from "../../src/lib/booking-service/payments.js"
import { createProcessedSquareWebhookEvent, findProcessedSquareWebhookEvent } from "../../src/lib/supabase/server-database.js"
import { getSquarePaymentFromEvent, getSquarePaymentIdentifiers } from "../../src/lib/square/payments.js"
import { getWebhookNotificationUrl, verifySquareWebhookSignature } from "../../src/lib/square/webhooks.js"
import { readRawBody, sendJson } from "../_lib/http.js"

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed." })
  }

  const rawBody = (await readRawBody(request)) || (typeof request.body === "string" ? request.body : JSON.stringify(request.body ?? {}))
  const signature = request.headers["x-square-hmacsha256-signature"]
  const notificationUrl = getWebhookNotificationUrl(request)

  try {
    const isValid = verifySquareWebhookSignature({
      body: rawBody,
      signature,
      notificationUrl,
    })

    if (!isValid) {
      return sendJson(response, 400, { error: "Webhook verification failed." })
    }

    const event = JSON.parse(rawBody)
    const existingEvent = await findProcessedSquareWebhookEvent(event.event_id)

    if (existingEvent.data) {
      return sendJson(response, 200, { received: true, duplicate: true })
    }

    const payment = getSquarePaymentFromEvent(event)
    const identifiers = getSquarePaymentIdentifiers(payment)
    const booking = payment
      ? await confirmBookingDepositPaid({
          squareEventId: event.event_id,
          paymentId: identifiers.paymentId,
          squareOrderId: identifiers.orderId,
          processedAt: new Date(event.created_at || Date.now()),
        })
      : null

    const eventInsert = await createProcessedSquareWebhookEvent({
      square_event_id: event.event_id,
      event_type: event.type,
      booking_id: booking?.id ?? null,
      square_checkout_id: booking?.square_checkout_id ?? null,
      payload: event,
    })

    if (eventInsert.error && eventInsert.error.code !== "23505") {
      throw new Error("Webhook processing could not be recorded.")
    }

    return sendJson(response, 200, { received: true })
  } catch (error) {
    return sendJson(response, 400, {
      error: error.message || "Webhook processing failed.",
    })
  }
}
