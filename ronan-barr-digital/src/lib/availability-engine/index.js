import { normalizeBusinessSettingsRecord } from "../businessSettings"
import { AVAILABILITY_STATUS, normalizeAvailabilityException } from "../availability"
import { normalizeTreatmentRecord, TREATMENT_STATUS } from "../treatments"

const DEFAULT_SLOT_INTERVAL_MINUTES = 15

function startOfDay(date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfDay(date) {
  const value = startOfDay(date)
  value.setDate(value.getDate() + 1)
  return value
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function dateFromKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`)
}

function combineDateAndTime(date, timeValue) {
  const [hours = "0", minutes = "0"] = String(timeValue ?? "00:00").split(":")
  const value = new Date(date)
  value.setHours(Number(hours), Number(minutes), 0, 0)
  return value
}

function clampRangeToDay(start, end, date) {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const clampedStart = start < dayStart ? dayStart : start
  const clampedEnd = end > dayEnd ? dayEnd : end

  if (clampedEnd <= clampedStart) {
    return null
  }

  return { start: clampedStart, end: clampedEnd }
}

function rangesOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && rightStart < leftEnd
}

function resolveDayKey(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase()
}

function normalizeEngineInputs({ businessSettings, treatment, availabilityExceptions = [], now = new Date() }) {
  return {
    businessSettings: normalizeBusinessSettingsRecord(businessSettings),
    treatment: treatment ? normalizeTreatmentRecord(treatment) : null,
    availabilityExceptions: availabilityExceptions.map(normalizeAvailabilityException),
    now: new Date(now),
  }
}

export function isBusinessOpen({ businessSettings, date }) {
  const settings = normalizeBusinessSettingsRecord(businessSettings)
  const dayKey = resolveDayKey(date)
  const hours = settings.opening_hours?.[dayKey]

  return Boolean(hours && !hours.closed && hours.open && hours.close)
}

export function isTreatmentBookable(treatment) {
  const normalizedTreatment = normalizeTreatmentRecord(treatment ?? {})

  return Boolean(
    normalizedTreatment &&
      normalizedTreatment.booking_enabled &&
      normalizedTreatment.status === TREATMENT_STATUS.ACTIVE &&
      normalizedTreatment.options?.length
  )
}

function validateBookingWindow({ businessSettings, date, now }) {
  const settings = normalizeBusinessSettingsRecord(businessSettings)
  const targetDay = startOfDay(date)
  const currentDay = startOfDay(now)
  const minimumNoticeCutoff = addMinutes(now, settings.minimum_notice_hours * 60)
  const maximumDate = addMinutes(currentDay, settings.maximum_booking_days * 24 * 60)

  if (targetDay < currentDay) {
    return { valid: false, reason: "PAST_DATE" }
  }

  if (targetDay > maximumDate) {
    return { valid: false, reason: "OUTSIDE_MAX_ADVANCE_BOOKING" }
  }

  return {
    valid: true,
    minimumNoticeCutoff,
  }
}

function getSlotIntervalMinutes(settings) {
  const normalizedSettings = normalizeBusinessSettingsRecord(settings)
  return Math.max(Number(normalizedSettings.booking_buffer_minutes) || 0, DEFAULT_SLOT_INTERVAL_MINUTES)
}

function getOccupiedSlotLengthMinutes({ businessSettings, treatmentOption }) {
  const settings = normalizeBusinessSettingsRecord(businessSettings)
  const durationMinutes = Number(treatmentOption?.duration_minutes ?? treatmentOption?.durationMinutes ?? 0)

  return durationMinutes + settings.appointment_gap_minutes + settings.booking_buffer_minutes
}

export function getUnavailablePeriods({ date, availabilityExceptions = [] }) {
  return availabilityExceptions
    .map(normalizeAvailabilityException)
    .filter((record) => record.status === AVAILABILITY_STATUS.ACTIVE)
    .map((record) => {
      const range = clampRangeToDay(new Date(record.start_datetime), new Date(record.end_datetime), date)

      if (!range) {
        return null
      }

      return {
        ...record,
        start: range.start,
        end: range.end,
      }
    })
    .filter(Boolean)
    .sort((left, right) => left.start.getTime() - right.start.getTime())
}

export function isSlotAvailable({
  slotStart,
  businessSettings,
  treatment,
  treatmentOption,
  availabilityExceptions = [],
  now = new Date(),
}) {
  const inputs = normalizeEngineInputs({ businessSettings, treatment, availabilityExceptions, now })
  const slotDate = new Date(slotStart)

  if (!isBusinessOpen({ businessSettings: inputs.businessSettings, date: slotDate })) {
    return { available: false, reason: "BUSINESS_CLOSED" }
  }

  if (!isTreatmentBookable(inputs.treatment)) {
    return { available: false, reason: "TREATMENT_UNAVAILABLE" }
  }

  const bookingWindow = validateBookingWindow({
    businessSettings: inputs.businessSettings,
    date: slotDate,
    now: inputs.now,
  })

  if (!bookingWindow.valid) {
    return { available: false, reason: bookingWindow.reason }
  }

  if (slotDate < bookingWindow.minimumNoticeCutoff) {
    return { available: false, reason: "BEFORE_MINIMUM_NOTICE" }
  }

  const dayKey = resolveDayKey(slotDate)
  const hours = inputs.businessSettings.opening_hours[dayKey]
  const dayOpen = combineDateAndTime(slotDate, hours.open)
  const dayClose = combineDateAndTime(slotDate, hours.close)
  const occupiedMinutes = getOccupiedSlotLengthMinutes({
    businessSettings: inputs.businessSettings,
    treatmentOption,
  })
  const slotEnd = addMinutes(slotDate, occupiedMinutes)

  if (slotDate < dayOpen || slotEnd > dayClose) {
    return { available: false, reason: "OUTSIDE_BUSINESS_HOURS" }
  }

  const blockedPeriods = getUnavailablePeriods({
    date: slotDate,
    availabilityExceptions: inputs.availabilityExceptions,
  })

  const conflictingPeriod = blockedPeriods.find((period) => rangesOverlap(slotDate, slotEnd, period.start, period.end))

  if (conflictingPeriod) {
    return {
      available: false,
      reason: "CONFLICTING_EXCEPTION",
      conflictingPeriod,
    }
  }

  return {
    available: true,
    start: slotDate,
    end: slotEnd,
  }
}

export function getAvailableSlots({
  date,
  businessSettings,
  treatment,
  treatmentOption = null,
  availabilityExceptions = [],
  now = new Date(),
}) {
  const inputs = normalizeEngineInputs({ businessSettings, treatment, availabilityExceptions, now })
  const targetDate = typeof date === "string" ? dateFromKey(date) : new Date(date)
  const bookingWindow = validateBookingWindow({
    businessSettings: inputs.businessSettings,
    date: targetDate,
    now: inputs.now,
  })

  if (!bookingWindow.valid || !isBusinessOpen({ businessSettings: inputs.businessSettings, date: targetDate }) || !isTreatmentBookable(inputs.treatment)) {
    return []
  }

  const selectedOption =
    treatmentOption ??
    inputs.treatment.options?.[0] ??
    null

  if (!selectedOption) {
    return []
  }

  const dayKey = resolveDayKey(targetDate)
  const hours = inputs.businessSettings.opening_hours[dayKey]
  const openTime = combineDateAndTime(targetDate, hours.open)
  const closeTime = combineDateAndTime(targetDate, hours.close)
  const intervalMinutes = getSlotIntervalMinutes(inputs.businessSettings)
  const slots = []

  for (let cursor = new Date(openTime); cursor < closeTime; cursor = addMinutes(cursor, intervalMinutes)) {
    const result = isSlotAvailable({
      slotStart: cursor,
      businessSettings: inputs.businessSettings,
      treatment: inputs.treatment,
      treatmentOption: selectedOption,
      availabilityExceptions: inputs.availabilityExceptions,
      now: inputs.now,
    })

    if (result.available) {
      slots.push({
        start: result.start,
        end: result.end,
        label: result.start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
      })
    }
  }

  return slots
}

export function getDailyAvailability({
  date,
  businessSettings,
  treatment,
  treatmentOption = null,
  availabilityExceptions = [],
  now = new Date(),
}) {
  const inputs = normalizeEngineInputs({ businessSettings, treatment, availabilityExceptions, now })
  const targetDate = typeof date === "string" ? dateFromKey(date) : new Date(date)
  const bookable = isTreatmentBookable(inputs.treatment)
  const open = isBusinessOpen({ businessSettings: inputs.businessSettings, date: targetDate })
  const bookingWindow = validateBookingWindow({
    businessSettings: inputs.businessSettings,
    date: targetDate,
    now: inputs.now,
  })
  const unavailablePeriods = getUnavailablePeriods({
    date: targetDate,
    availabilityExceptions: inputs.availabilityExceptions,
  })

  if (!open || !bookable || !bookingWindow.valid) {
    return {
      date: toDateKey(targetDate),
      isBusinessOpen: open,
      isTreatmentBookable: bookable,
      reason: bookingWindow.valid ? (!open ? "BUSINESS_CLOSED" : "TREATMENT_UNAVAILABLE") : bookingWindow.reason,
      unavailablePeriods,
      slots: [],
    }
  }

  return {
    date: toDateKey(targetDate),
    isBusinessOpen: true,
    isTreatmentBookable: true,
    unavailablePeriods,
    slots: getAvailableSlots({
      date: targetDate,
      businessSettings: inputs.businessSettings,
      treatment: inputs.treatment,
      treatmentOption,
      availabilityExceptions: inputs.availabilityExceptions,
      now: inputs.now,
    }),
  }
}
