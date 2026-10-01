export const BUSINESS_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

export const DEFAULT_OPENING_HOURS = {
  monday: { open: "10:00", close: "21:00", closed: false },
  tuesday: { open: "10:00", close: "21:00", closed: false },
  wednesday: { open: "", close: "", closed: true },
  thursday: { open: "10:00", close: "21:00", closed: false },
  friday: { open: "10:00", close: "16:00", closed: false },
  saturday: { open: "09:00", close: "13:00", closed: false },
  sunday: { open: "", close: "", closed: true },
}

export const DEFAULT_BUSINESS_SETTINGS = {
  opening_hours: DEFAULT_OPENING_HOURS,
  booking_buffer_minutes: 15,
  minimum_notice_hours: 4,
  maximum_booking_days: 90,
  appointment_gap_minutes: 0,
  default_deposit_type: "fixed",
  default_deposit_value: 20,
}

export function getDefaultDepositValue(settings) {
  return Number(settings?.default_deposit_value ?? DEFAULT_BUSINESS_SETTINGS.default_deposit_value)
}

export function getDefaultDepositType(settings) {
  return settings?.default_deposit_type ?? DEFAULT_BUSINESS_SETTINGS.default_deposit_type
}

export function formatCurrencyAmount(value) {
  const numericValue = Number(value ?? 0)

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function formatDepositRequirement(settings, treatmentPrice) {
  const depositType = getDefaultDepositType(settings)
  const depositValue = getDefaultDepositValue(settings)

  if (depositType === "percentage") {
    if (typeof treatmentPrice === "number" && Number.isFinite(treatmentPrice)) {
      const calculatedAmount = (treatmentPrice * depositValue) / 100
      return `${depositValue}% (${formatCurrencyAmount(calculatedAmount)})`
    }

    return `${depositValue}%`
  }

  return formatCurrencyAmount(depositValue)
}

export function getDepositAmountForPrice(settings, treatmentPrice = 0) {
  const depositType = getDefaultDepositType(settings)
  const depositValue = getDefaultDepositValue(settings)
  const numericPrice = Number(treatmentPrice ?? 0)

  if (depositType === "percentage") {
    return Number(((numericPrice * depositValue) / 100).toFixed(2))
  }

  return Number(depositValue.toFixed ? depositValue.toFixed(2) : Number(depositValue).toFixed(2))
}

export function normalizeOpeningHours(openingHours = {}) {
  return BUSINESS_DAYS.reduce((hours, day) => {
    const value = openingHours[day.key] ?? DEFAULT_OPENING_HOURS[day.key]

    hours[day.key] = {
      open: value.open ?? "",
      close: value.close ?? "",
      closed: Boolean(value.closed),
    }

    return hours
  }, {})
}

export function normalizeBusinessSettingsRecord(record) {
  return {
    ...DEFAULT_BUSINESS_SETTINGS,
    ...record,
    opening_hours: normalizeOpeningHours(record?.opening_hours),
    booking_buffer_minutes: Number(record?.booking_buffer_minutes ?? DEFAULT_BUSINESS_SETTINGS.booking_buffer_minutes),
    minimum_notice_hours: Number(record?.minimum_notice_hours ?? DEFAULT_BUSINESS_SETTINGS.minimum_notice_hours),
    maximum_booking_days: Number(record?.maximum_booking_days ?? DEFAULT_BUSINESS_SETTINGS.maximum_booking_days),
    appointment_gap_minutes: Number(record?.appointment_gap_minutes ?? DEFAULT_BUSINESS_SETTINGS.appointment_gap_minutes),
    default_deposit_type: record?.default_deposit_type ?? DEFAULT_BUSINESS_SETTINGS.default_deposit_type,
    default_deposit_value: Number(record?.default_deposit_value ?? DEFAULT_BUSINESS_SETTINGS.default_deposit_value),
  }
}

export function formatTimeForDisplay(time) {
  if (!time) return ""

  const [hoursValue = "0", minutesValue = "00"] = time.split(":")
  const hours = Number(hoursValue)
  const minutes = Number(minutesValue)
  const suffix = hours >= 12 ? "pm" : "am"
  const twelveHour = hours % 12 || 12

  return `${twelveHour}:${String(minutes).padStart(2, "0")}${suffix}`
}

export function formatOpeningHoursList(openingHours = DEFAULT_OPENING_HOURS) {
  const normalizedHours = normalizeOpeningHours(openingHours)

  return BUSINESS_DAYS.map((day) => {
    const value = normalizedHours[day.key]

    if (value.closed) {
      return `${day.label}: Closed`
    }

    return `${day.label}: ${formatTimeForDisplay(value.open)} - ${formatTimeForDisplay(value.close)}`
  })
}

export function buildOpeningHoursSpecification(openingHours = DEFAULT_OPENING_HOURS) {
  const normalizedHours = normalizeOpeningHours(openingHours)

  return BUSINESS_DAYS.flatMap((day) => {
    const value = normalizedHours[day.key]

    if (value.closed || !value.open || !value.close) {
      return []
    }

    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day.label,
        opens: value.open,
        closes: value.close,
      },
    ]
  })
}

export function validateBusinessSettings(settings) {
  const errors = {}
  const normalizedHours = normalizeOpeningHours(settings.opening_hours)

  BUSINESS_DAYS.forEach((day) => {
    const value = normalizedHours[day.key]

    if (value.closed) {
      return
    }

    if (!value.open || !value.close) {
      errors[day.key] = "Please enter both an opening and closing time."
      return
    }

    if (value.open >= value.close) {
      errors[day.key] = "Closing time must be later than opening time."
    }
  })

  const numericFields = [
    ["booking_buffer_minutes", "Booking buffer"],
    ["minimum_notice_hours", "Minimum booking notice"],
    ["maximum_booking_days", "Maximum advance booking"],
    ["appointment_gap_minutes", "Appointment gap"],
    ["default_deposit_value", "Default deposit"],
  ]

  numericFields.forEach(([key, label]) => {
    const value = Number(settings[key])

    if (Number.isNaN(value) || value < 0) {
      errors[key] = `${label} must be zero or greater.`
    }
  })

  if (Number(settings.maximum_booking_days) <= 0) {
    errors.maximum_booking_days = "Maximum advance booking must be at least 1 day."
  }

  if (settings.default_deposit_type === "percentage" && Number(settings.default_deposit_value) > 100) {
    errors.default_deposit_value = "A percentage deposit cannot be greater than 100%."
  }

  return errors
}

export function buildBusinessSettingsPayload(settings) {
  const normalizedHours = normalizeOpeningHours(settings.opening_hours)

  return {
    opening_hours: BUSINESS_DAYS.reduce((hours, day) => {
      const value = normalizedHours[day.key]

      hours[day.key] = value.closed
        ? { open: null, close: null, closed: true }
        : { open: value.open, close: value.close, closed: false }

      return hours
    }, {}),
    booking_buffer_minutes: Number(settings.booking_buffer_minutes),
    minimum_notice_hours: Number(settings.minimum_notice_hours),
    maximum_booking_days: Number(settings.maximum_booking_days),
    appointment_gap_minutes: Number(settings.appointment_gap_minutes),
    default_deposit_type: settings.default_deposit_type,
    default_deposit_value: Number(settings.default_deposit_value),
  }
}
