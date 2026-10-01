import supabase from "./client"
import { normalizeBookingActivityRecord } from "../activity/activity"
import { buildBusinessSettingsPayload, normalizeBusinessSettingsRecord } from "../businessSettings"
import { normalizeAvailabilityException } from "../availability"
import { normalizeBookingRecord, normalizeBookingReservations } from "../bookings"
import { normalizeTreatmentRecord, sortTreatments } from "../treatments"

export async function getBusinessSettings() {
  const response = await supabase.from("business_settings").select("*").single()

  if (response.data) {
    return {
      ...response,
      data: normalizeBusinessSettingsRecord(response.data),
    }
  }

  return response
}

export async function updateBusinessSettings(payload) {
  const response = await supabase
    .from("business_settings")
    .update(buildBusinessSettingsPayload(payload))
    .eq("id", 1)
    .select("*")
    .single()

  if (response.data) {
    return {
      ...response,
      data: normalizeBusinessSettingsRecord(response.data),
    }
  }

  return response
}

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

export async function listAdminTreatments() {
  const response = await supabase
    .from("treatments")
    .select("*, treatment_options(*)")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  return normalizeTreatmentsResponse(response)
}

export async function listPublicTreatments() {
  const response = await supabase
    .from("treatments")
    .select("*, treatment_options(*)")
    .eq("status", "ACTIVE")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  return normalizeTreatmentsResponse(response)
}

export async function listTreatmentsForIds(ids = []) {
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

export async function saveTreatmentWithOptions({ treatment, options }) {
  const treatmentResponse = await supabase.from("treatments").upsert(treatment).select("*").single()

  if (treatmentResponse.error || !treatmentResponse.data) {
    return treatmentResponse
  }

  const treatmentId = treatmentResponse.data.id
  const existingOptionsResponse = await supabase.from("treatment_options").select("id").eq("treatment_id", treatmentId)

  if (existingOptionsResponse.error) {
    return { data: null, error: existingOptionsResponse.error }
  }

  const savedOptionsPayload = options.map((option) => ({
    ...option,
    treatment_id: treatmentId,
  }))

  if (savedOptionsPayload.length > 0) {
    const upsertOptionsResponse = await supabase.from("treatment_options").upsert(savedOptionsPayload).select("*")

    if (upsertOptionsResponse.error) {
      return { data: null, error: upsertOptionsResponse.error }
    }
  }

  const retainedIds = new Set(savedOptionsPayload.map((option) => option.id).filter(Boolean))
  const optionIdsToDelete = (existingOptionsResponse.data ?? [])
    .map((option) => option.id)
    .filter((id) => !retainedIds.has(id))

  if (optionIdsToDelete.length > 0) {
    const deleteResponse = await supabase.from("treatment_options").delete().in("id", optionIdsToDelete)

    if (deleteResponse.error) {
      return { data: null, error: deleteResponse.error }
    }
  }

  const refreshedResponse = await supabase
    .from("treatments")
    .select("*, treatment_options(*)")
    .eq("id", treatmentId)
    .single()

  return normalizeTreatmentsResponse(refreshedResponse)
}

export async function listAvailabilityExceptions({ from, to } = {}) {
  let query = supabase.from("availability_exceptions").select("*").order("start_datetime", { ascending: true })

  if (from) {
    query = query.gte("start_datetime", from)
  }

  if (to) {
    query = query.lte("end_datetime", to)
  }

  const response = await query

  if (response.data) {
    return {
      ...response,
      data: response.data.map(normalizeAvailabilityException),
    }
  }

  return response
}

export async function listPublicAvailabilityPeriods() {
  const response = await supabase.from("public_availability_periods").select("*").order("start_datetime", { ascending: true })

  if (response.data) {
    return {
      ...response,
      data: response.data.map(normalizeAvailabilityException),
    }
  }

  return response
}

export async function upsertAvailabilityException(payload) {
  const response = await supabase.from("availability_exceptions").upsert(payload).select().single()

  if (response.data) {
    return {
      ...response,
      data: normalizeAvailabilityException(response.data),
    }
  }

  return response
}

export async function setAvailabilityExceptionStatus(id, status) {
  const response = await supabase
    .from("availability_exceptions")
    .update({ status })
    .eq("id", id)
    .select()
    .single()

  if (response.data) {
    return {
      ...response,
      data: normalizeAvailabilityException(response.data),
    }
  }

  return response
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

export async function listBookings() {
  const response = await supabase
    .from("bookings")
    .select("*, treatment:treatments(*, treatment_options(*)), treatment_option:treatment_options(*)")
    .order("created_at", { ascending: false })

  return normalizeBookingsResponse(response)
}

export async function getBookingById(id) {
  const response = await supabase
    .from("bookings")
    .select("*, treatment:treatments(*, treatment_options(*)), treatment_option:treatment_options(*)")
    .eq("id", id)
    .single()

  return normalizeBookingsResponse(response)
}

export async function createBookingRecord(payload) {
  const response = await supabase.from("bookings").insert(payload)

  if (!response.error) {
    return {
      ...response,
      data: payload,
    }
  }

  return response
}

export async function updateBookingRecord(id, payload) {
  const response = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", id)
    .select("*, treatment:treatments(*, treatment_options(*)), treatment_option:treatment_options(*)")
    .single()

  return normalizeBookingsResponse(response)
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

export async function createBookingActivity(payload) {
  const response = await supabase.from("booking_activity").insert(payload).select("*").single()
  return normalizeBookingActivityResponse(response)
}

export async function listBookingActivity(bookingId) {
  return normalizeBookingActivityResponse(
    await supabase.from("booking_activity").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false })
  )
}

export async function createBookingTimelineEvent(payload) {
  return supabase.from("booking_timeline_events").insert(payload).select("*").single()
}

export async function listBookingTimelineEvents(bookingId) {
  return supabase
    .from("booking_timeline_events")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
}

export async function listBookingReservations() {
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
