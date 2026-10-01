import { BOOKING_SOURCE } from "../bookings"
import {
  createBookingActivity,
  listBookingActivity,
} from "../supabase/database"
import {
  createServerBookingActivity,
  listServerBookingActivity,
} from "../supabase/server-database"
import { buildBookingActivityPayload } from "./helpers"
import { BOOKING_ACTIVITY_ACTOR_TYPE, BOOKING_ACTIVITY_EVENT } from "./constants"

async function recordWith(createFn, payload) {
  return createFn(buildBookingActivityPayload(payload))
}

export async function recordActivity(payload) {
  return recordWith(createBookingActivity, payload)
}

export async function recordServerActivity(payload) {
  return recordWith(createServerBookingActivity, payload)
}

export async function listBookingActivityHistory(bookingId) {
  return listBookingActivity(bookingId)
}

export async function listServerBookingActivityHistory(bookingId) {
  return listServerBookingActivity(bookingId)
}

export async function recordBookingRequestedActivity({ booking }) {
  const isAdminBooking = booking.source === BOOKING_SOURCE.ADMINISTRATOR

  return recordActivity({
    bookingId: booking.id,
    eventType: BOOKING_ACTIVITY_EVENT.BOOKING_REQUESTED,
    title: isAdminBooking ? "Booking Request Added" : "Booking Request Received",
    description: isAdminBooking
      ? "Beata created this booking request on behalf of the customer."
      : "A new booking request was received and is waiting for Beata's review.",
    performedBy: isAdminBooking ? "Beata" : "Customer",
    performedByType: isAdminBooking ? BOOKING_ACTIVITY_ACTOR_TYPE.ADMIN : BOOKING_ACTIVITY_ACTOR_TYPE.CUSTOMER,
    metadata: {
      source: booking.source,
      treatmentId: booking.treatment_id,
      treatmentOptionId: booking.treatment_option_id,
    },
  })
}

export async function recordAdminBookingActivity({
  bookingId,
  eventType,
  title,
  description,
  metadata = {},
  createdAt,
}) {
  return recordActivity({
    bookingId,
    eventType,
    title,
    description,
    performedBy: "Beata",
    performedByType: BOOKING_ACTIVITY_ACTOR_TYPE.ADMIN,
    metadata,
    createdAt,
  })
}

export async function recordSystemBookingActivity({
  bookingId,
  eventType,
  title,
  description,
  metadata = {},
  createdAt,
}) {
  return recordServerActivity({
    bookingId,
    eventType,
    title,
    description,
    performedBy: "System",
    performedByType: BOOKING_ACTIVITY_ACTOR_TYPE.SYSTEM,
    metadata,
    createdAt,
  })
}
