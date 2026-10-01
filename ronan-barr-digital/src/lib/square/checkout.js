import { squareRequest, getSquareServerConfigValue } from "./client"
import { SQUARE_DEFAULT_CURRENCY } from "./constants"
import { createSquareIdempotencyKey, getSquareCurrency, toSquareAmount } from "./helpers"

export async function createSquareCheckout({
  booking,
  depositAmount,
  paymentReference,
  redirectUrl,
  expiresAt,
}) {
  const locationId = getSquareServerConfigValue("locationId")
  const currency = getSquareCurrency(booking?.currency || SQUARE_DEFAULT_CURRENCY)

  const payload = {
    idempotency_key: createSquareIdempotencyKey("deposit"),
    order: {
      location_id: locationId,
      reference_id: paymentReference,
      line_items: [
        {
          name: `Deposit for ${booking?.treatment?.name ?? "Retreat by the Mournes booking"}`,
          quantity: "1",
          base_price_money: {
            amount: toSquareAmount(depositAmount),
            currency,
          },
        },
      ],
    },
    checkout_options: {
      redirect_url: redirectUrl,
    },
    description: `Deposit request for booking ${booking?.id}`,
    pre_populated_data: {
      buyer_email: booking?.client_email ?? undefined,
    },
  }

  const response = await squareRequest("/v2/online-checkout/payment-links", {
    method: "POST",
    body: payload,
  })

  return {
    checkoutId: response.payment_link?.id ?? null,
    checkoutUrl: response.payment_link?.url ?? null,
    orderId: response.payment_link?.order_id ?? response.related_resources?.orders?.[0]?.id ?? null,
    version: response.payment_link?.version ?? null,
    expiresAt,
    raw: response,
  }
}

export async function cancelSquareCheckout(checkoutId) {
  if (!checkoutId) {
    return null
  }

  return squareRequest(`/v2/online-checkout/payment-links/${checkoutId}`, {
    method: "DELETE",
  }).catch(() => null)
}
