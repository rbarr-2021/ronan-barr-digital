import { SQUARE_EVENT_TYPES } from "./constants"

export function getSquarePaymentFromEvent(event) {
  const payment = event?.data?.object?.payment

  if (!payment) {
    return null
  }

  if (![SQUARE_EVENT_TYPES.PAYMENT_CREATED, SQUARE_EVENT_TYPES.PAYMENT_UPDATED].includes(event.type)) {
    return null
  }

  if (payment.status !== "COMPLETED") {
    return null
  }

  return payment
}

export function getSquarePaymentIdentifiers(payment) {
  return {
    paymentId: payment?.id ?? null,
    orderId: payment?.order_id ?? null,
    referenceId: payment?.reference_id ?? null,
  }
}
