import { BOOKING_ACTIVITY_ACTOR_LABEL, BOOKING_ACTIVITY_ACTOR_TYPE, BOOKING_ACTIVITY_META } from "./constants"

export function normalizeBookingActivityRecord(record) {
  const meta = BOOKING_ACTIVITY_META[record.event_type] ?? null
  const performedByType = record.performed_by_type ?? BOOKING_ACTIVITY_ACTOR_TYPE.SYSTEM

  return {
    ...record,
    event_title: record.event_title ?? meta?.title ?? "Booking Activity",
    event_description: record.event_description ?? null,
    performed_by_type: performedByType,
    performed_by: record.performed_by ?? BOOKING_ACTIVITY_ACTOR_LABEL[performedByType] ?? BOOKING_ACTIVITY_ACTOR_LABEL.SYSTEM,
    metadata: record.metadata ?? {},
    icon: meta?.icon ?? "\u{1F6E0}",
    tone: meta?.tone ?? "neutral",
  }
}
