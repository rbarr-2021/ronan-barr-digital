import { formatBookingDate, formatBookingTime, formatBookingCommunicationSummary } from "../bookings"
import { getRetreatWhatsAppUrl } from "../contact"

function buildBookingReference(booking) {
  return {
    id: booking?.id ?? null,
    clientName: booking?.client_name ?? "",
    clientEmail: booking?.client_email ?? "",
    clientPhone: booking?.client_phone ?? "",
    treatmentName: booking?.treatment?.name ?? "Treatment",
    treatmentDuration: booking?.treatment_option?.label ?? "",
    requestedDate: booking?.requested_date ? formatBookingDate(booking.requested_date) : "",
    requestedTime: booking?.start_time ? formatBookingTime(booking.start_time) : "",
    communicationSummary: formatBookingCommunicationSummary(booking),
  }
}

function buildSupportMessage(booking) {
  const treatmentName = booking?.treatment?.name ?? "my booking"
  const requestedDate = booking?.requested_date ? formatBookingDate(booking.requested_date) : "my requested appointment"

  return `Hello Beata, I have a question about ${treatmentName} for ${requestedDate}.`
}

export function buildSupportSection(booking) {
  return {
    heading: "Need help?",
    lines: [
      "Questions about your booking?",
      "Need to make a change?",
      "We're here to help.",
    ],
    buttonLabel: "Message Beata on WhatsApp",
    buttonUrl: getRetreatWhatsAppUrl(buildSupportMessage(booking)),
    note: "Please don't submit another booking request if you've already requested this appointment.",
  }
}

export function buildWhatsAppSupportClosing() {
  return [
    "Questions about your booking?",
    "You can reply to this WhatsApp message or contact Beata directly.",
  ]
}

export function buildCustomerEmailTemplate(type, booking) {
  const reference = buildBookingReference(booking)

  const templates = {
    BOOKING_RECEIVED: {
      subject: "Your booking request has been received",
      previewText: "We've received your request and Beata will review it personally.",
      heading: "Your booking request has been received",
      message:
        "Thank you for getting in touch. Beata will personally review your request and will contact you soon to guide you through the next step.",
      nextStep: "There is nothing you need to do just now.",
    },
    DEPOSIT_REQUESTED: {
      subject: "Your deposit is ready",
      previewText: "Your booking request has been reviewed and the next step is your deposit.",
      heading: "Your deposit is ready",
      message:
        "Your request has been reviewed and your preferred appointment can now move to the deposit stage.",
      nextStep: "We'll send your secure payment link separately.",
    },
    BOOKING_CONFIRMED: {
      subject: "Your retreat is confirmed",
      previewText: "Your appointment is now confirmed.",
      heading: "Your retreat is confirmed",
      message: "Your appointment is now confirmed and reserved for you.",
      nextStep: "We'll be in touch again nearer the time with a gentle reminder.",
    },
    APPOINTMENT_REMINDER: {
      subject: "A gentle reminder about your appointment",
      previewText: "Your treatment is coming up soon.",
      heading: "A gentle reminder about your appointment",
      message: "Your appointment is coming up soon and we're looking forward to welcoming you.",
      nextStep: "If anything has changed, please let us know as soon as you can.",
    },
    BOOKING_CANCELLED: {
      subject: "Your booking has been cancelled",
      previewText: "Your appointment is no longer scheduled.",
      heading: "Your booking has been cancelled",
      message: "Your appointment is no longer scheduled.",
      nextStep: "If you would like to arrange another time, we'll be happy to help.",
    },
  }

  return {
    type,
    audience: "customer",
    channel: "email",
    reference,
    supportSection: buildSupportSection(booking),
    ...templates[type],
  }
}

export function buildCustomerWhatsAppTemplate(type, booking) {
  const reference = buildBookingReference(booking)

  const templates = {
    BOOKING_RECEIVED: {
      intro: "Your booking request has been received.",
      body: "Beata will personally review your request and guide you through the next step.",
    },
    DEPOSIT_REQUESTED: {
      intro: "Your deposit is ready.",
      body: "Your request has been reviewed and can now move to the deposit stage.",
    },
    BOOKING_CONFIRMED: {
      intro: "Your retreat is confirmed.",
      body: "Your appointment is now confirmed and reserved for you.",
    },
    APPOINTMENT_REMINDER: {
      intro: "A gentle reminder about your appointment.",
      body: "We're looking forward to welcoming you soon.",
    },
    BOOKING_CANCELLED: {
      intro: "Your booking has been cancelled.",
      body: "If you would like to arrange another time, we'll be happy to help.",
    },
  }

  return {
    type,
    audience: "customer",
    channel: "whatsapp",
    reference,
    ...templates[type],
    closingLines: buildWhatsAppSupportClosing(),
  }
}

export function buildAdminNotificationTemplate(type, booking) {
  const reference = buildBookingReference(booking)

  const templates = {
    ADMIN_NEW_BOOKING_REQUEST: {
      subject: "New booking request",
      previewText: "A new booking request is waiting for review.",
      heading: "New booking request",
      message: "A new booking request is waiting for your attention.",
      nextStep: "Review the request and decide whether to request the deposit, suggest another time, or decline it.",
    },
    ADMIN_DEPOSIT_PAID: {
      subject: "Deposit received",
      previewText: "A client deposit has been received.",
      heading: "Deposit received",
      message: "A client deposit has been received and the booking is ready for confirmation.",
      nextStep: "Review the booking and confirm the appointment when you are ready.",
    },
    ADMIN_BOOKING_CANCELLED: {
      subject: "Booking cancelled",
      previewText: "A booking has been cancelled.",
      heading: "Booking cancelled",
      message: "A booking has been cancelled and may need a follow-up.",
      nextStep: "Review the calendar and decide whether any further action is needed.",
    },
  }

  return {
    type,
    audience: "administrator",
    channel: "email",
    reference,
    ...templates[type],
  }
}
