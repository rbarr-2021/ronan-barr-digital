export const AVAILABILITY_KIND_CONFIG = {
  HOLIDAY: {
    label: "Holiday",
    dbType: "HOLIDAY",
    colorClass: "holiday",
    defaultReason: "Holiday",
  },
  PERSONAL_APPOINTMENT: {
    label: "Personal Appointment",
    dbType: "PERSONAL",
    colorClass: "personal",
    defaultReason: "Personal appointment",
  },
  LUNCH_BREAK: {
    label: "Lunch Break",
    dbType: "BREAK",
    colorClass: "lunch",
    defaultReason: "Lunch break",
  },
  TRAINING: {
    label: "Training",
    dbType: "OTHER",
    colorClass: "training",
    defaultReason: "Training",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dbType: "OTHER",
    colorClass: "maintenance",
    defaultReason: "Maintenance",
  },
  BLOCKED_TIME: {
    label: "Blocked Time",
    dbType: "BOOKING",
    colorClass: "blocked",
    defaultReason: "Blocked time",
  },
  OTHER: {
    label: "Other",
    dbType: "OTHER",
    colorClass: "other",
    defaultReason: "Unavailable",
  },
}

export const AVAILABILITY_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
}

export const AVAILABILITY_SORT_OPTIONS = {
  DATE_ASC: "DATE_ASC",
  DATE_DESC: "DATE_DESC",
  TYPE_ASC: "TYPE_ASC",
  STATUS_ASC: "STATUS_ASC",
}

export const DEFAULT_AVAILABILITY_FILTERS = {
  search: "",
  status: "ALL",
  kind: "ALL",
  startDate: "",
  endDate: "",
  sort: AVAILABILITY_SORT_OPTIONS.DATE_ASC,
}

export const DEFAULT_AVAILABILITY_FORM = {
  id: null,
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "10:00",
  reason: "",
  kind: "BLOCKED_TIME",
  notes: "",
  status: AVAILABILITY_STATUS.ACTIVE,
}

export const QUICK_ACTIONS = [
  {
    id: "block-today",
    label: "Block Today",
    build(start = new Date()) {
      const isoDate = toDateInputValue(start)

      return {
        ...DEFAULT_AVAILABILITY_FORM,
        startDate: isoDate,
        endDate: isoDate,
        startTime: "09:00",
        endTime: "17:00",
        kind: "BLOCKED_TIME",
        reason: "Blocked time",
      }
    },
  },
  {
    id: "lunch-break",
    label: "Lunch Break",
    build(start = new Date()) {
      const isoDate = toDateInputValue(start)

      return {
        ...DEFAULT_AVAILABILITY_FORM,
        startDate: isoDate,
        endDate: isoDate,
        startTime: "13:00",
        endTime: "14:00",
        kind: "LUNCH_BREAK",
        reason: "Lunch break",
      }
    },
  },
  {
    id: "holiday",
    label: "Holiday",
    build(start = new Date()) {
      const isoDate = toDateInputValue(start)

      return {
        ...DEFAULT_AVAILABILITY_FORM,
        startDate: isoDate,
        endDate: isoDate,
        startTime: "00:00",
        endTime: "23:59",
        kind: "HOLIDAY",
        reason: "Holiday",
      }
    },
  },
  {
    id: "personal-appointment",
    label: "Personal Appointment",
    build(start = new Date()) {
      const isoDate = toDateInputValue(start)

      return {
        ...DEFAULT_AVAILABILITY_FORM,
        startDate: isoDate,
        endDate: isoDate,
        startTime: "10:00",
        endTime: "11:30",
        kind: "PERSONAL_APPOINTMENT",
        reason: "Personal appointment",
      }
    },
  },
  {
    id: "training",
    label: "Training",
    build(start = new Date()) {
      const isoDate = toDateInputValue(start)

      return {
        ...DEFAULT_AVAILABILITY_FORM,
        startDate: isoDate,
        endDate: isoDate,
        startTime: "09:00",
        endTime: "12:00",
        kind: "TRAINING",
        reason: "Training",
      }
    },
  },
  {
    id: "maintenance",
    label: "Maintenance",
    build(start = new Date()) {
      const isoDate = toDateInputValue(start)

      return {
        ...DEFAULT_AVAILABILITY_FORM,
        startDate: isoDate,
        endDate: isoDate,
        startTime: "09:00",
        endTime: "11:00",
        kind: "MAINTENANCE",
        reason: "Maintenance",
      }
    },
  },
]

export function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function toDateTimeInput(dateValue, timeValue) {
  return new Date(`${dateValue}T${timeValue}:00`)
}

export function formatDateTimeRange(startIso, endIso) {
  const start = new Date(startIso)
  const end = new Date(endIso)

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  })

  const sameDate = start.toDateString() === end.toDateString()

  if (sameDate) {
    return {
      dateLabel: dateFormatter.format(start),
      timeLabel: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
    }
  }

  return {
    dateLabel: `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`,
    timeLabel: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
  }
}

export function getAvailabilityKindOptions() {
  return Object.entries(AVAILABILITY_KIND_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  }))
}

export function normalizeAvailabilityException(record) {
  const normalizedKind = record.kind && AVAILABILITY_KIND_CONFIG[record.kind] ? record.kind : inferKindFromLegacyType(record.type)

  return {
    ...record,
    kind: normalizedKind,
    status: record.status ?? AVAILABILITY_STATUS.ACTIVE,
    notes: record.notes ?? "",
  }
}

function inferKindFromLegacyType(type) {
  switch (type) {
    case "HOLIDAY":
      return "HOLIDAY"
    case "PERSONAL":
      return "PERSONAL_APPOINTMENT"
    case "BREAK":
      return "LUNCH_BREAK"
    case "BOOKING":
      return "BLOCKED_TIME"
    default:
      return "OTHER"
  }
}

export function formatAvailabilityException(record) {
  const normalizedRecord = normalizeAvailabilityException(record)
  const kindConfig = AVAILABILITY_KIND_CONFIG[normalizedRecord.kind]

  return {
    ...normalizedRecord,
    label: kindConfig.label,
    colorClass: kindConfig.colorClass,
    ...formatDateTimeRange(normalizedRecord.start_datetime, normalizedRecord.end_datetime),
  }
}

export function buildAvailabilityPayload(formValues) {
  const kindConfig = AVAILABILITY_KIND_CONFIG[formValues.kind]

  return {
    id: formValues.id ?? undefined,
    start_datetime: toDateTimeInput(formValues.startDate, formValues.startTime).toISOString(),
    end_datetime: toDateTimeInput(formValues.endDate, formValues.endTime).toISOString(),
    type: kindConfig.dbType,
    kind: formValues.kind,
    reason: formValues.reason.trim(),
    notes: formValues.notes.trim() || null,
    status: formValues.status,
  }
}

export function buildAvailabilityForm(record) {
  const normalizedRecord = normalizeAvailabilityException(record)
  const start = new Date(normalizedRecord.start_datetime)
  const end = new Date(normalizedRecord.end_datetime)

  return {
    id: normalizedRecord.id,
    startDate: toDateInputValue(start),
    startTime: start.toTimeString().slice(0, 5),
    endDate: toDateInputValue(end),
    endTime: end.toTimeString().slice(0, 5),
    reason: normalizedRecord.reason ?? "",
    kind: normalizedRecord.kind,
    notes: normalizedRecord.notes ?? "",
    status: normalizedRecord.status ?? AVAILABILITY_STATUS.ACTIVE,
  }
}

export function validateAvailabilityException(formValues, existingRecords = []) {
  const errors = {}

  if (!formValues.reason.trim()) {
    errors.reason = "Please enter a reason for this unavailable period."
  }

  if (!formValues.startDate || !formValues.startTime || !formValues.endDate || !formValues.endTime) {
    errors.datetime = "Please enter both a start and end date/time."
    return errors
  }

  const start = toDateTimeInput(formValues.startDate, formValues.startTime)
  const end = toDateTimeInput(formValues.endDate, formValues.endTime)

  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    errors.datetime = "Please enter valid start and end times."
    return errors
  }

  if (end <= start) {
    errors.datetime = "End time must be later than start time."
  }

  const duplicateMatch = existingRecords.some((record) => {
    if (record.id === formValues.id) return false

    const normalizedRecord = normalizeAvailabilityException(record)

    return (
      normalizedRecord.start_datetime === start.toISOString() &&
      normalizedRecord.end_datetime === end.toISOString() &&
      normalizedRecord.kind === formValues.kind &&
      (normalizedRecord.reason ?? "").trim().toLowerCase() === formValues.reason.trim().toLowerCase()
    )
  })

  if (duplicateMatch) {
    errors.duplicate = "An identical availability exception already exists."
  }

  if (start < new Date()) {
    errors.pastWarning = "This exception starts in the past. You can still save it if needed."
  }

  return errors
}

export function filterAvailabilityExceptions(records, filters) {
  const normalizedSearch = filters.search.trim().toLowerCase()

  const filtered = records.filter((record) => {
    const formatted = formatAvailabilityException(record)
    const startDate = formatted.start_datetime.slice(0, 10)
    const endDate = formatted.end_datetime.slice(0, 10)

    if (filters.status !== "ALL" && formatted.status !== filters.status) {
      return false
    }

    if (filters.kind !== "ALL" && formatted.kind !== filters.kind) {
      return false
    }

    if (filters.startDate && endDate < filters.startDate) {
      return false
    }

    if (filters.endDate && startDate > filters.endDate) {
      return false
    }

    if (
      normalizedSearch &&
      !`${formatted.reason ?? ""} ${formatted.notes ?? ""} ${formatted.label}`.toLowerCase().includes(normalizedSearch)
    ) {
      return false
    }

    return true
  })

  return filtered.sort((left, right) => {
    const formattedLeft = formatAvailabilityException(left)
    const formattedRight = formatAvailabilityException(right)

    switch (filters.sort) {
      case AVAILABILITY_SORT_OPTIONS.DATE_DESC:
        return formattedRight.start_datetime.localeCompare(formattedLeft.start_datetime)
      case AVAILABILITY_SORT_OPTIONS.TYPE_ASC:
        return formattedLeft.label.localeCompare(formattedRight.label)
      case AVAILABILITY_SORT_OPTIONS.STATUS_ASC:
        return formattedLeft.status.localeCompare(formattedRight.status)
      case AVAILABILITY_SORT_OPTIONS.DATE_ASC:
      default:
        return formattedLeft.start_datetime.localeCompare(formattedRight.start_datetime)
    }
  })
}

export function getMonthGrid(referenceDate) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const gridStart = new Date(monthStart)
  const startDay = (monthStart.getDay() + 6) % 7
  gridStart.setDate(monthStart.getDate() - startDay)

  const gridEnd = new Date(monthEnd)
  const endDay = (monthEnd.getDay() + 6) % 7
  gridEnd.setDate(monthEnd.getDate() + (6 - endDay))

  const days = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function getWeekDays(referenceDate) {
  const current = new Date(referenceDate)
  const weekDayIndex = (current.getDay() + 6) % 7
  current.setDate(current.getDate() - weekDayIndex)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(current)
    day.setDate(current.getDate() + index)
    return day
  })
}

export function getEventsForDate(records, date) {
  const dateKey = toDateInputValue(date)

  return records.filter((record) => {
    const formatted = formatAvailabilityException(record)
    return formatted.start_datetime.slice(0, 10) <= dateKey && formatted.end_datetime.slice(0, 10) >= dateKey
  })
}
