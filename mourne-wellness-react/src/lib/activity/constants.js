export const BOOKING_ACTIVITY_EVENT = {
  BOOKING_REQUESTED: "BOOKING_REQUESTED",
  BOOKING_REVIEWED: "BOOKING_REVIEWED",
  BOOKING_UPDATED: "BOOKING_UPDATED",
  BOOKING_DECLINED: "BOOKING_DECLINED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",
  DEPOSIT_REQUESTED: "DEPOSIT_REQUESTED",
  DEPOSIT_LINK_CREATED: "DEPOSIT_LINK_CREATED",
  DEPOSIT_PAID: "DEPOSIT_PAID",
  DEPOSIT_EXPIRED: "DEPOSIT_EXPIRED",
  DEPOSIT_CANCELLED: "DEPOSIT_CANCELLED",
  CUSTOMER_UPDATED_DETAILS: "CUSTOMER_UPDATED_DETAILS",
  ADMIN_UPDATED_BOOKING: "ADMIN_UPDATED_BOOKING",
  WHATSAPP_SENT: "WHATSAPP_SENT",
  EMAIL_SENT: "EMAIL_SENT",
  CALENDAR_EVENT_CREATED: "CALENDAR_EVENT_CREATED",
}

export const BOOKING_ACTIVITY_ACTOR_TYPE = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  SYSTEM: "SYSTEM",
}

export const BOOKING_ACTIVITY_ACTOR_LABEL = {
  [BOOKING_ACTIVITY_ACTOR_TYPE.CUSTOMER]: "Customer",
  [BOOKING_ACTIVITY_ACTOR_TYPE.ADMIN]: "Beata",
  [BOOKING_ACTIVITY_ACTOR_TYPE.SYSTEM]: "System",
}

export const BOOKING_ACTIVITY_META = {
  [BOOKING_ACTIVITY_EVENT.BOOKING_REQUESTED]: {
    icon: "\u{1F4C5}",
    title: "Booking Request Received",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.BOOKING_REVIEWED]: {
    icon: "\u{1F50D}",
    title: "Booking Reviewed",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.BOOKING_UPDATED]: {
    icon: "\u270F",
    title: "Booking Updated",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.BOOKING_DECLINED]: {
    icon: "\u274C",
    title: "Booking Declined",
    tone: "warning",
  },
  [BOOKING_ACTIVITY_EVENT.BOOKING_CANCELLED]: {
    icon: "\u274C",
    title: "Booking Cancelled",
    tone: "warning",
  },
  [BOOKING_ACTIVITY_EVENT.BOOKING_CONFIRMED]: {
    icon: "\u2705",
    title: "Booking Confirmed",
    tone: "success",
  },
  [BOOKING_ACTIVITY_EVENT.BOOKING_COMPLETED]: {
    icon: "\u2713",
    title: "Booking Completed",
    tone: "success",
  },
  [BOOKING_ACTIVITY_EVENT.DEPOSIT_REQUESTED]: {
    icon: "\u{1F4B3}",
    title: "Deposit Requested",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.DEPOSIT_LINK_CREATED]: {
    icon: "\u{1F4E8}",
    title: "Deposit Link Created",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.DEPOSIT_PAID]: {
    icon: "\u{1F4B3}",
    title: "Deposit Paid",
    tone: "success",
  },
  [BOOKING_ACTIVITY_EVENT.DEPOSIT_EXPIRED]: {
    icon: "\u23F3",
    title: "Deposit Request Expired",
    tone: "warning",
  },
  [BOOKING_ACTIVITY_EVENT.DEPOSIT_CANCELLED]: {
    icon: "\u274C",
    title: "Deposit Request Cancelled",
    tone: "warning",
  },
  [BOOKING_ACTIVITY_EVENT.CUSTOMER_UPDATED_DETAILS]: {
    icon: "\u270F",
    title: "Customer Updated Details",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.ADMIN_UPDATED_BOOKING]: {
    icon: "\u270F",
    title: "Administrator Updated Booking",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.WHATSAPP_SENT]: {
    icon: "\u{1F4AC}",
    title: "WhatsApp Sent",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.EMAIL_SENT]: {
    icon: "\u{1F4E7}",
    title: "Email Sent",
    tone: "neutral",
  },
  [BOOKING_ACTIVITY_EVENT.CALENDAR_EVENT_CREATED]: {
    icon: "\u{1F5D3}",
    title: "Calendar Event Created",
    tone: "neutral",
  },
}
