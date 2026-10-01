import { BOOKING_ACTIVITY_ACTOR_LABEL, BOOKING_ACTIVITY_ACTOR_TYPE, BOOKING_ACTIVITY_META } from "./constants"

export function getBookingActivityMeta(eventType) {
  return (
    BOOKING_ACTIVITY_META[eventType] ?? {
      icon: "\u{1F6E0}",
      title: "Booking Activity",
      tone: "neutral",
    }
  )
}

export function getBookingActivityActor(actorType, actorName) {
  const resolvedActorType = actorType ?? BOOKING_ACTIVITY_ACTOR_TYPE.SYSTEM

  return {
    actorType: resolvedActorType,
    actorLabel: actorName ?? BOOKING_ACTIVITY_ACTOR_LABEL[resolvedActorType] ?? BOOKING_ACTIVITY_ACTOR_LABEL.SYSTEM,
  }
}

export function buildBookingActivityPayload({
  bookingId,
  eventType,
  title,
  description = null,
  performedBy,
  performedByType,
  metadata = {},
  createdAt,
}) {
  const meta = getBookingActivityMeta(eventType)
  const actor = getBookingActivityActor(performedByType, performedBy)

  return {
    booking_id: bookingId,
    event_type: eventType,
    event_title: title ?? meta.title,
    event_description: description,
    performed_by: actor.actorLabel,
    performed_by_type: actor.actorType,
    metadata,
    ...(createdAt ? { created_at: createdAt } : {}),
  }
}

export function formatBookingActivityDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatBookingActivityTime(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
