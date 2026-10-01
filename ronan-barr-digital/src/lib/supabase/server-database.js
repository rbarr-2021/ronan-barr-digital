import { normalizeBookingActivityRecord } from "../activity/activity"
import { normalizeAvailabilityException } from "../availability"
import { normalizeBookingRecord, normalizeBookingReservations } from "../bookings"
import { normalizeBusinessSettingsRecord } from "../businessSettings"
import { normalizeTreatmentRecord, sortTreatments } from "../treatments"
import { getAdminSupabaseClient } from "./admin"

function normalizeTreatmentsResponse(response) {
  if (!response.data) {
    return response
  }

  const normalizedData = Array.isArray(response.data)
    ? sortTreatments(response.data.map(normalizeTreatmentRecord))
    : normalizeTreatmentRecord(response.data)

  return {
    ...response,
    data: normalizedData,
  }
}

function normalizeBookingsResponse(response) {
  if (!response.data) {
    return response
  }

  const normalizedData = Array.isArray(response.data)
    ? response.data.map(normalizeBookingRecord)
    : normalizeBookingRecord(response.data)

  return {
    ...response,
    data: normalizedData,
  }
}

function normalizeBookingActivityResponse(response) {
  if (!response.data) {
    return response
  }

  const normalizedData = Array.isArray(response.data)
    ? response.data.map(normalizeBookingActivityRecord)
    : normalizeBookingActivityRecord(response.data)

  return {
    ...response,
    data: normalizedData,
  }
}

export async function getServerBusinessSettings() {
  const supabase = getAdminSupabaseClient()
  const response = await supabase.from("business_settings").select("*").single()

  if (response.data) {
    return {
      ...response,
      data: normalizeBusinessSettingsRecord(response.data),
    }
  }

  return response
}

export async function getServerBookingById(id) {
  const supabase = getAdminSupabaseClient()
  const response = await supabase
    .from("bookings")
    .select("*, treatment:treatments(*, treatment_options(*)), treatment_option:treatment_options(*)")
    .eq("id", id)
    .single()

  return normalizeBookingsResponse(response)
}

export async function findServerBookingBySquareOrderId(squareOrderId) {
  const supabase = getAdminSupabaseClient()
  const response = await supabase
    .from("bookings")
    .select("*, treatment:treatments(*, treatment_options(*)), treatment_option:treatment_options(*)")
    .eq("square_order_id", squareOrderId)
    .maybeSingle()

  return normalizeBookingsResponse(response)
}

export async function updateServerBookingRecord(id, payload) {
  const supabase = getAdminSupabaseClient()
  const response = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", id)
    .select("*, treatment:treatments(*, treatment_options(*)), treatment_option:treatment_options(*)")
    .single()

  return normalizeBookingsResponse(response)
}

export async function listServerAvailabilityExceptions() {
  const supabase = getAdminSupabaseClient()
  const response = await supabase.from("availability_exceptions").select("*").order("start_datetime", { ascending: true })

  if (response.data) {
    return {
      ...response,
      data: response.data.map(normalizeAvailabilityException),
    }
  }

  return response
}

export async function listServerBookingReservations() {
  const supabase = getAdminSupabaseClient()
  const response = await supabase
    .from("public_booking_reservations")
    .select("*")
    .order("requested_date", { ascending: true })
    .order("start_time", { ascending: true })

  if (response.data) {
    return {
      ...response,
      data: normalizeBookingReservations(response.data),
    }
  }

  return response
}

export async function listServerTreatmentsForIds(ids = []) {
  const supabase = getAdminSupabaseClient()
  let query = supabase
    .from("treatments")
    .select("*, treatment_options(*)")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (ids.length > 0) {
    query = query.in("id", ids)
  }

  return normalizeTreatmentsResponse(await query)
}

export async function createServerBookingActivity(payload) {
  const supabase = getAdminSupabaseClient()
  const response = await supabase.from("booking_activity").insert(payload).select("*").single()
  return normalizeBookingActivityResponse(response)
}

export async function listServerBookingActivity(bookingId) {
  const supabase = getAdminSupabaseClient()
  const response = await supabase.from("booking_activity").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false })
  return normalizeBookingActivityResponse(response)
}

export async function createServerBookingTimelineEvent(payload) {
  const supabase = getAdminSupabaseClient()
  return supabase.from("booking_timeline_events").insert(payload).select("*").single()
}

export async function listServerBookingTimelineEvents(bookingId) {
  const supabase = getAdminSupabaseClient()
  return supabase
    .from("booking_timeline_events")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
}

export async function createServerBookingDomainEvent(payload) {
  const supabase = getAdminSupabaseClient()
  return supabase.from("booking_domain_events").insert(payload).select("*").single()
}

export async function findProcessedSquareWebhookEvent(squareEventId) {
  const supabase = getAdminSupabaseClient()
  return supabase.from("square_webhook_events").select("*").eq("square_event_id", squareEventId).maybeSingle()
}

export async function createProcessedSquareWebhookEvent(payload) {
  const supabase = getAdminSupabaseClient()
  return supabase.from("square_webhook_events").insert(payload).select("*").single()
}
