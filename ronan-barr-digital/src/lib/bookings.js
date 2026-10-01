import { normalizeTreatmentRecord } from "./treatments"

export const BOOKING_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  READY_FOR_DEPOSIT: "READY_FOR_DEPOSIT",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DECLINED: "DECLINED",
}

export const BOOKING_DEPOSIT_STATUS = {
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
}

export const BOOKING_DEPOSIT_REQUEST_STATUS = {
  NONE: "NONE",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  PAID: "PAID",
}

export const BOOKING_DEPOSIT_STATUS_META = {
  [BOOKING_DEPOSIT_STATUS.NOT_REQUIRED]: {
    label: "Not Required",
    shortLabel: "Not Required",
  },
  [BOOKING_DEPOSIT_STATUS.PENDING]: {
    label: "Awaiting Deposit",
    shortLabel: "Awaiting Deposit",
  },
  [BOOKING_DEPOSIT_STATUS.PAID]: {
    label: "Deposit Received",
    shortLabel: "Paid",
  },
  [BOOKING_DEPOSIT_STATUS.REFUNDED]: {
    label: "Deposit Refunded",
    shortLabel: "Refunded",
  },
}

export const BOOKING_SOURCE = {
  WEBSITE: "WEBSITE",
  ADMINISTRATOR: "ADMINISTRATOR",
}

export const BOOKING_TIMELINE_EVENT = {
  BOOKING_REQUEST_RECEIVED: "BOOKING_REQUEST_RECEIVED",
  DEPOSIT_REQUESTED: "DEPOSIT_REQUESTED",
  DEPOSIT_LINK_CREATED: "DEPOSIT_LINK_CREATED",
  DEPOSIT_PAID: "DEPOSIT_PAID",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  DEPOSIT_REQUEST_EXPIRED: "DEPOSIT_REQUEST_EXPIRED",
  DEPOSIT_REQUEST_CANCELLED: "DEPOSIT_REQUEST_CANCELLED",
}

export const BOOKING_DOMAIN_EVENT = {
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
}

export const SLOT_LOCK_HOURS = 24

export const BOOKING_STATUS_META = {
  [BOOKING_STATUS.PENDING_REVIEW]: {
    label: "Pending Review",
    shortLabel: "Pending",
    colorClass: "pending",
    icon: "Request",
  },
  [BOOKING_STATUS.READY_FOR_DEPOSIT]: {
    label: "Awaiting Deposit",
    shortLabel: "Awaiting Deposit",
    colorClass: "ready",
    icon: "Deposit",
  },
  [BOOKING_STATUS.CONFIRMED]: {
    label: "Confirmed",
    shortLabel: "Confirmed",
    colorClass: "confirmed",
    icon: "Confirmed",
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: "Completed",
    shortLabel: "Completed",
    colorClass: "completed",
    icon: "Completed",
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    colorClass: "cancelled",
    icon: "Cancelled",
  },
  [BOOKING_STATUS.DECLINED]: {
    label: "Declined",
    shortLabel: "Declined",
    colorClass: "declined",
    icon: "Declined",
  },
}

export function getEmptyHealthInformation() {
  return {
    pregnant: "no",
    injuries: "",
    medicalConditions: "",
    anythingElse: "",
  }
}

export function normalizeHealthInformation(healthInformation) {
  const value = healthInformation ?? {}

  return {
    pregnant: value.pregnant ?? "no",
    injuries: value.injuries ?? value.injuries_text ?? "",
    medicalConditions: value.medicalConditions ?? value.medical_conditions ?? "",
    anythingElse: value.anythingElse ?? value.anything_else ?? "",
  }
}

export function getBookingCommunicationChannels(booking) {
  return [
    {
      key: "email",
      icon: "📧",
      label: "Email",
      selected: true,
      detail: "Included",
    },
    {
      key: "whatsapp",
      icon: "📱",
      label: "WhatsApp",
      selected: Boolean(booking?.whatsapp_notifications),
      detail: booking?.whatsapp_notifications ? "Selected" : "Not Selected",
    },
  ]
}

export function formatBookingCommunicationSummary(booking) {
  return booking?.whatsapp_notifications ? "📧 Email • 📱 WhatsApp" : "📧 Email Only"
}

export function combineBookingDateAndTime(dateValue, timeValue) {
  return new Date(`${dateValue}T${String(timeValue).slice(0, 5)}:00`)
}

export function toTimeValue(date) {
  return new Date(date).toTimeString().slice(0, 5)
}

export function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function getBookingStatusMeta(status) {
  return BOOKING_STATUS_META[status] ?? BOOKING_STATUS_META[BOOKING_STATUS.PENDING_REVIEW]
}

export function getBookingDepositStatusMeta(status) {
  return BOOKING_DEPOSIT_STATUS_META[status] ?? BOOKING_DEPOSIT_STATUS_META[BOOKING_DEPOSIT_STATUS.PENDING]
}

export function isDepositRequestExpired(booking, now = new Date()) {
  if (!booking?.deposit_expires_at) {
    return false
  }

  if (booking.deposit_status === BOOKING_DEPOSIT_STATUS.PAID) {
    return false
  }

  return new Date(booking.deposit_expires_at) <= new Date(now)
}

export function getBookingDepositRequestStatus(booking, now = new Date()) {
  if (!booking) {
    return BOOKING_DEPOSIT_REQUEST_STATUS.NONE
  }

  if (booking.deposit_status === BOOKING_DEPOSIT_STATUS.PAID || booking.deposit_request_status === BOOKING_DEPOSIT_REQUEST_STATUS.PAID) {
    return BOOKING_DEPOSIT_REQUEST_STATUS.PAID
  }

  if (booking.deposit_request_status === BOOKING_DEPOSIT_REQUEST_STATUS.CANCELLED) {
    return BOOKING_DEPOSIT_REQUEST_STATUS.CANCELLED
  }

  if (isDepositRequestExpired(booking, now)) {
    return BOOKING_DEPOSIT_REQUEST_STATUS.EXPIRED
  }

  if (booking.square_checkout_id && booking.deposit_request_status === BOOKING_DEPOSIT_REQUEST_STATUS.ACTIVE) {
    return BOOKING_DEPOSIT_REQUEST_STATUS.ACTIVE
  }

  return booking.deposit_request_status ?? BOOKING_DEPOSIT_REQUEST_STATUS.NONE
}

export function formatBookingDateTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function isBookingSlotReserved(booking, now = new Date()) {
  if (!booking) return false

  if (booking.status === BOOKING_STATUS.READY_FOR_DEPOSIT || booking.status === BOOKING_STATUS.CONFIRMED) {
    return true
  }

  if (booking.status !== BOOKING_STATUS.PENDING_REVIEW) {
    return false
  }

  if (!booking.slot_locked_until) {
    return true
  }

  return new Date(booking.slot_locked_until) > new Date(now)
}

export function createReservedPeriodFromBooking(booking) {
  return {
    id: booking.id,
    kind: "BLOCKED_TIME",
    type: "BOOKING",
    status: "ACTIVE",
    reason: `${booking.treatment?.name ?? "Booking request"} reserved`,
    notes: booking.additional_notes ?? "",
    start_datetime: combineBookingDateAndTime(booking.requested_date, booking.start_time).toISOString(),
    end_datetime: combineBookingDateAndTime(booking.requested_date, booking.end_time).toISOString(),
  }
}

export function normalizeBookingRecord(record) {
  const treatment = record.treatment ? normalizeTreatmentRecord(record.treatment) : record.treatments ? normalizeTreatmentRecord(record.treatments) : null
  const treatmentOption = record.treatment_option ?? record.treatment_options ?? null

  return {
    ...record,
    treatment,
    treatment_option: treatmentOption,
    whatsapp_notifications: Boolean(record.whatsapp_notifications),
    deposit_amount: Number(record.deposit_amount ?? 0),
    currency: record.currency ?? "GBP",
    square_checkout_id: record.square_checkout_id ?? null,
    square_checkout_url: record.square_checkout_url ?? null,
    square_order_id: record.square_order_id ?? null,
    square_payment_id: record.square_payment_id ?? null,
    payment_reference: record.payment_reference ?? null,
    deposit_requested_at: record.deposit_requested_at ?? null,
    deposit_expires_at: record.deposit_expires_at ?? null,
    deposit_paid_at: record.deposit_paid_at ?? null,
    payment_provider: record.payment_provider ?? null,
    deposit_request_status: record.deposit_request_status ?? BOOKING_DEPOSIT_REQUEST_STATUS.NONE,
    health_information: normalizeHealthInformation(record.health_information),
    additional_notes: record.additional_notes ?? "",
    admin_notes: record.admin_notes ?? "",
    status: record.status ?? BOOKING_STATUS.PENDING_REVIEW,
    deposit_status: record.deposit_status ?? BOOKING_DEPOSIT_STATUS.PENDING,
    source: record.source ?? BOOKING_SOURCE.WEBSITE,
  }
}

export function normalizeBookingReservations(records = []) {
  return records.map((record) => ({
    ...record,
    status: record.status ?? BOOKING_STATUS.PENDING_REVIEW,
  }))
}

export function formatBookingDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatBookingTime(timeValue) {
  return String(timeValue).slice(0, 5)
}

export function formatBookingDateShort(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function buildBookingCalendarEvent(booking) {
  const meta = getBookingStatusMeta(booking.status)

  return {
    id: booking.id,
    label: booking.treatment?.name ?? "Booking request",
    colorClass: meta.colorClass,
    icon: meta.icon,
    dateLabel: formatBookingDateShort(booking.requested_date),
    timeLabel: `${formatBookingTime(booking.start_time)} - ${formatBookingTime(booking.end_time)}`,
    reason: booking.client_name,
    start_datetime: combineBookingDateAndTime(booking.requested_date, booking.start_time).toISOString(),
    end_datetime: combineBookingDateAndTime(booking.requested_date, booking.end_time).toISOString(),
  }
}
