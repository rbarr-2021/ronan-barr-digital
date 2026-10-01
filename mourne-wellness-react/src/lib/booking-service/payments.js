import { getAvailableSlots } from "../availability-engine"
import { BOOKING_ACTIVITY_EVENT } from "../activity/constants"
import { recordAdminBookingActivity, recordSystemBookingActivity } from "../activity/activity-service"
import { getDepositAmountForPrice } from "../businessSettings"
import {
  BOOKING_DEPOSIT_REQUEST_STATUS,
  BOOKING_DEPOSIT_STATUS,
  BOOKING_DOMAIN_EVENT,
  BOOKING_STATUS,
  SLOT_LOCK_HOURS,
  createReservedPeriodFromBooking,
  getBookingDepositRequestStatus,
  isBookingSlotReserved,
  normalizeBookingReservations,
  toTimeValue,
} from "../bookings"
import { createSquareCheckout, cancelSquareCheckout } from "../square/checkout"
import { SQUARE_DEFAULT_CURRENCY, SQUARE_PAYMENT_PROVIDER } from "../square/constants"
import { generatePaymentReference, getDepositExpiryDate } from "../square/helpers"
import {
  createServerBookingDomainEvent,
  findServerBookingBySquareOrderId,
  getServerBookingById,
  getServerBusinessSettings,
  listServerAvailabilityExceptions,
  listServerBookingReservations,
  listServerTreatmentsForIds,
  updateServerBookingRecord,
} from "../supabase/server-database"
import { normalizeTreatmentRecord, TREATMENT_STATUS } from "../treatments"

function createBookingLifecycleError(message) {
  return new Error(message)
}

function getReservedPeriods(bookings, excludeBookingId = null, now = new Date()) {
  return normalizeBookingReservations(bookings)
    .filter((booking) => booking.id !== excludeBookingId)
    .filter((booking) => isBookingSlotReserved(booking, now))
    .map(createReservedPeriodFromBooking)
}

async function loadServerBookingContext({ booking, now = new Date() }) {
  const [{ data: settingsData }, { data: availabilityData }, { data: reservationsData }, { data: treatmentsData }] = await Promise.all([
    getServerBusinessSettings(),
    listServerAvailabilityExceptions(),
    listServerBookingReservations(),
    listServerTreatmentsForIds([booking.treatment_id]),
  ])

  const treatmentRecord = (treatmentsData ?? []).find((entry) => entry.id === booking.treatment_id)

  if (!treatmentRecord) {
    throw createBookingLifecycleError("This treatment is no longer available.")
  }

  const treatment = normalizeTreatmentRecord(treatmentRecord)

  if (treatment.status !== TREATMENT_STATUS.ACTIVE || !treatment.booking_enabled) {
    throw createBookingLifecycleError("This treatment is not currently open for booking.")
  }

  const treatmentOption = treatment.options.find((option) => option.id === booking.treatment_option_id)

  if (!treatmentOption) {
    throw createBookingLifecycleError("This booking no longer has a valid treatment duration.")
  }

  return {
    now,
    businessSettings: settingsData,
    availabilityExceptions: availabilityData ?? [],
    reservations: reservationsData ?? [],
    treatment,
    treatmentOption,
  }
}

function ensureBookingCanMoveToDeposit({ booking, context }) {
  const availableSlots = getAvailableSlots({
    date: booking.requested_date,
    businessSettings: context.businessSettings,
    treatment: context.treatment,
    treatmentOption: context.treatmentOption,
    availabilityExceptions: [...context.availabilityExceptions, ...getReservedPeriods(context.reservations, booking.id, context.now)],
    now: context.now,
  })

  const matchedSlot = availableSlots.find((slot) => toTimeValue(slot.start) === String(booking.start_time).slice(0, 5))

  if (!matchedSlot) {
    throw createBookingLifecycleError("This appointment time is no longer available.")
  }
}

async function addActivityEvent({ bookingId, eventType, title, description, metadata = {}, createdAt, actorType = "SYSTEM" }) {
  const payload = {
    bookingId,
    eventType,
    title,
    description,
    metadata,
    createdAt: createdAt ?? new Date().toISOString(),
  }

  if (actorType === "ADMIN") {
    await recordAdminBookingActivity(payload)
    return
  }

  await recordSystemBookingActivity(payload)
}

function getCurrentDepositState(booking, now = new Date()) {
  return getBookingDepositRequestStatus(booking, now)
}

export async function createDepositRequestForBooking({
  bookingId,
  baseUrl,
  replaceExisting = false,
  now = new Date(),
}) {
  const bookingResponse = await getServerBookingById(bookingId)

  if (bookingResponse.error || !bookingResponse.data) {
    throw createBookingLifecycleError("This booking request could not be found.")
  }

  const booking = bookingResponse.data

  if ([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.COMPLETED].includes(booking.status)) {
    throw createBookingLifecycleError("This booking can no longer accept a deposit request.")
  }

  if (booking.deposit_status === BOOKING_DEPOSIT_STATUS.PAID || booking.status === BOOKING_STATUS.CONFIRMED) {
    throw createBookingLifecycleError("Payment has already been received for this booking.")
  }

  const currentDepositState = getCurrentDepositState(booking, now)

  if (currentDepositState === BOOKING_DEPOSIT_REQUEST_STATUS.ACTIVE && !replaceExisting) {
    throw createBookingLifecycleError("A payment link is already active for this booking.")
  }

  const context = await loadServerBookingContext({ booking, now })
  ensureBookingCanMoveToDeposit({ booking, context })

  if (currentDepositState === BOOKING_DEPOSIT_REQUEST_STATUS.EXPIRED) {
    await addActivityEvent({
      bookingId,
      eventType: BOOKING_ACTIVITY_EVENT.DEPOSIT_EXPIRED,
      title: "Deposit Request Expired",
      description: "The previous secure payment link expired before the deposit was paid.",
      metadata: {
        squareCheckoutId: booking.square_checkout_id,
      },
      createdAt: now.toISOString(),
    })
  }

  if (currentDepositState === BOOKING_DEPOSIT_REQUEST_STATUS.ACTIVE && booking.square_checkout_id) {
    await cancelSquareCheckout(booking.square_checkout_id)
    await addActivityEvent({
      bookingId,
      eventType: BOOKING_ACTIVITY_EVENT.DEPOSIT_CANCELLED,
      title: "Deposit Request Cancelled",
      description: "The previous secure payment link was replaced with a new one.",
      metadata: {
        squareCheckoutId: booking.square_checkout_id,
      },
      createdAt: now.toISOString(),
      actorType: "ADMIN",
    })
  }

  const depositAmount = getDepositAmountForPrice(context.businessSettings, context.treatmentOption.price)
  const paymentReference = generatePaymentReference(booking.id)
  const expiresAt = getDepositExpiryDate(SLOT_LOCK_HOURS, now)
  const checkout = await createSquareCheckout({
    booking,
    depositAmount,
    paymentReference,
    redirectUrl: `${baseUrl.replace(/\/$/, "")}/treatments`,
    expiresAt: expiresAt.toISOString(),
  })

  const updateResponse = await updateServerBookingRecord(bookingId, {
    status: BOOKING_STATUS.READY_FOR_DEPOSIT,
    deposit_status: BOOKING_DEPOSIT_STATUS.PENDING,
    deposit_request_status: BOOKING_DEPOSIT_REQUEST_STATUS.ACTIVE,
    deposit_amount: depositAmount,
    currency: booking.currency || SQUARE_DEFAULT_CURRENCY,
    square_checkout_id: checkout.checkoutId,
    square_checkout_url: checkout.checkoutUrl,
    square_order_id: checkout.orderId,
    square_payment_id: null,
    payment_reference: paymentReference,
    deposit_requested_at: now.toISOString(),
    deposit_expires_at: expiresAt.toISOString(),
    deposit_paid_at: null,
    payment_provider: SQUARE_PAYMENT_PROVIDER,
    slot_locked_until: null,
  })

  if (updateResponse.error || !updateResponse.data) {
    throw createBookingLifecycleError("Could not create a payment link just now.")
  }

  await addActivityEvent({
    bookingId,
    eventType: BOOKING_ACTIVITY_EVENT.DEPOSIT_REQUESTED,
    title: "Deposit Requested",
    description: "Beata requested a deposit to confirm this retreat.",
    metadata: {
      depositAmount,
      paymentReference,
    },
    createdAt: now.toISOString(),
    actorType: "ADMIN",
  })

  await addActivityEvent({
    bookingId,
    eventType: BOOKING_ACTIVITY_EVENT.DEPOSIT_LINK_CREATED,
    title: "Deposit Link Created",
    description: "A secure Square payment link was created for this booking.",
    metadata: {
      squareCheckoutId: checkout.checkoutId,
      paymentReference,
      expiresAt: expiresAt.toISOString(),
    },
    createdAt: now.toISOString(),
  })

  return updateResponse.data
}

export async function cancelDepositRequestForBooking({ bookingId, now = new Date() }) {
  const bookingResponse = await getServerBookingById(bookingId)

  if (bookingResponse.error || !bookingResponse.data) {
    throw createBookingLifecycleError("This booking request could not be found.")
  }

  const booking = bookingResponse.data

  if (booking.deposit_status === BOOKING_DEPOSIT_STATUS.PAID) {
    throw createBookingLifecycleError("Payment has already been received for this booking.")
  }

  if (!booking.square_checkout_id) {
    throw createBookingLifecycleError("There is no active payment link to cancel.")
  }

  await cancelSquareCheckout(booking.square_checkout_id)

  const updateResponse = await updateServerBookingRecord(bookingId, {
    deposit_request_status: BOOKING_DEPOSIT_REQUEST_STATUS.CANCELLED,
    square_checkout_id: null,
    square_checkout_url: null,
    square_order_id: null,
    deposit_expires_at: null,
  })

  if (updateResponse.error || !updateResponse.data) {
    throw createBookingLifecycleError("Could not cancel this payment request just now.")
  }

  await addActivityEvent({
    bookingId,
    eventType: BOOKING_ACTIVITY_EVENT.DEPOSIT_CANCELLED,
    title: "Deposit Request Cancelled",
    description: "The secure payment link was cancelled before payment was received.",
    createdAt: now.toISOString(),
    actorType: "ADMIN",
  })

  return updateResponse.data
}

export async function confirmBookingDepositPaid({
  squareEventId,
  paymentId,
  squareOrderId,
  processedAt = new Date(),
}) {
  const bookingResponse = await findServerBookingBySquareOrderId(squareOrderId)

  if (bookingResponse.error) {
    throw createBookingLifecycleError("We couldn't match this payment to a booking.")
  }

  if (!bookingResponse.data) {
    return null
  }

  const booking = bookingResponse.data

  if (booking.deposit_status === BOOKING_DEPOSIT_STATUS.PAID || booking.status === BOOKING_STATUS.CONFIRMED) {
    return booking
  }

  const updateResponse = await updateServerBookingRecord(booking.id, {
    status: BOOKING_STATUS.CONFIRMED,
    deposit_status: BOOKING_DEPOSIT_STATUS.PAID,
    deposit_request_status: BOOKING_DEPOSIT_REQUEST_STATUS.PAID,
    square_payment_id: paymentId,
    deposit_paid_at: processedAt.toISOString(),
    payment_provider: SQUARE_PAYMENT_PROVIDER,
    slot_locked_until: null,
  })

  if (updateResponse.error || !updateResponse.data) {
    throw createBookingLifecycleError("We couldn't confirm this booking after payment.")
  }

  await addActivityEvent({
    bookingId: booking.id,
    eventType: BOOKING_ACTIVITY_EVENT.DEPOSIT_PAID,
    title: "Deposit Paid",
    description: "Square verified the deposit successfully.",
    metadata: {
      squareEventId,
      paymentId,
      squareOrderId,
    },
    createdAt: processedAt.toISOString(),
  })

  await addActivityEvent({
    bookingId: booking.id,
    eventType: BOOKING_ACTIVITY_EVENT.BOOKING_CONFIRMED,
    title: "Booking Confirmed",
    description: "The booking was confirmed automatically after the deposit was verified.",
    metadata: {
      squareEventId,
      paymentId,
      squareOrderId,
    },
    createdAt: processedAt.toISOString(),
  })

  await createServerBookingDomainEvent({
    booking_id: booking.id,
    event_type: BOOKING_DOMAIN_EVENT.BOOKING_CONFIRMED,
    payload: {
      bookingId: booking.id,
      paymentId,
      squareOrderId,
      occurredAt: processedAt.toISOString(),
    },
  })

  return updateResponse.data
}
