import {
  buildAdminNotificationTemplate,
  buildCustomerEmailTemplate,
  buildCustomerWhatsAppTemplate,
} from "./templates"

export const CUSTOMER_NOTIFICATION_TYPES = {
  BOOKING_RECEIVED: "BOOKING_RECEIVED",
  DEPOSIT_REQUESTED: "DEPOSIT_REQUESTED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
}

export const ADMIN_NOTIFICATION_TYPES = {
  NEW_BOOKING_REQUEST: "ADMIN_NEW_BOOKING_REQUEST",
  DEPOSIT_PAID: "ADMIN_DEPOSIT_PAID",
  BOOKING_CANCELLED: "ADMIN_BOOKING_CANCELLED",
}

function buildChannels({ booking, includeWhatsApp = false }) {
  const channels = [
    {
      channel: "email",
      enabled: true,
      recipient: booking?.client_email ?? null,
      status: "provider_not_connected",
    },
  ]

  if (includeWhatsApp) {
    channels.push({
      channel: "whatsapp",
      enabled: Boolean(booking?.whatsapp_notifications),
      recipient: booking?.client_phone ?? null,
      status: booking?.whatsapp_notifications ? "provider_not_connected" : "not_selected",
    })
  }

  return channels
}

function createNotificationDraft({ type, booking, audience, channels, templates }) {
  return {
    sent: false,
    provider: null,
    audience,
    type,
    bookingId: booking?.id ?? null,
    channels,
    templates,
  }
}

function createCustomerNotificationDraft(type, booking) {
  return createNotificationDraft({
    type,
    booking,
    audience: "customer",
    channels: buildChannels({ booking, includeWhatsApp: true }),
    templates: {
      email: buildCustomerEmailTemplate(type, booking),
      whatsapp: buildCustomerWhatsAppTemplate(type, booking),
    },
  })
}

export async function sendBookingReceived(booking) {
  return createCustomerNotificationDraft(CUSTOMER_NOTIFICATION_TYPES.BOOKING_RECEIVED, booking)
}

export async function sendDepositRequest(booking) {
  return createCustomerNotificationDraft(CUSTOMER_NOTIFICATION_TYPES.DEPOSIT_REQUESTED, booking)
}

export async function sendBookingConfirmed(booking) {
  return createCustomerNotificationDraft(CUSTOMER_NOTIFICATION_TYPES.BOOKING_CONFIRMED, booking)
}

export async function sendReminder(booking) {
  return createCustomerNotificationDraft(CUSTOMER_NOTIFICATION_TYPES.APPOINTMENT_REMINDER, booking)
}

export async function sendBookingCancelled(booking) {
  return createCustomerNotificationDraft(CUSTOMER_NOTIFICATION_TYPES.BOOKING_CANCELLED, booking)
}

function createAdminNotificationDraft(type, booking) {
  return createNotificationDraft({
    type,
    booking,
    audience: "administrator",
    channels: [
      {
        channel: "email",
        enabled: true,
        recipient: null,
        status: "provider_not_connected",
      },
    ],
    templates: {
      email: buildAdminNotificationTemplate(type, booking),
    },
  })
}

export async function notifyAdminNewBookingRequest(booking) {
  return createAdminNotificationDraft(ADMIN_NOTIFICATION_TYPES.NEW_BOOKING_REQUEST, booking)
}

export async function notifyAdminDepositPaid(booking) {
  return createAdminNotificationDraft(ADMIN_NOTIFICATION_TYPES.DEPOSIT_PAID, booking)
}

export async function notifyAdminBookingCancelled(booking) {
  return createAdminNotificationDraft(ADMIN_NOTIFICATION_TYPES.BOOKING_CANCELLED, booking)
}
