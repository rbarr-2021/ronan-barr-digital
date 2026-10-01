import { useEffect, useMemo, useRef, useState } from "react"
import { useOutletContext } from "react-router-dom"
import AdminEmptyState from "../../components/AdminEmptyState"
import AdminEditingHeader from "../../components/AdminEditingHeader"
import LoadingMessage from "../../components/LoadingMessage"
import Seo from "../../components/Seo"
import StatusMessage from "../../components/StatusMessage"
import { getDailyAvailability } from "../../lib/availability-engine"
import {
  AVAILABILITY_KIND_CONFIG,
  AVAILABILITY_SORT_OPTIONS,
  AVAILABILITY_STATUS,
  buildAvailabilityForm,
  buildAvailabilityPayload,
  DEFAULT_AVAILABILITY_FILTERS,
  DEFAULT_AVAILABILITY_FORM,
  filterAvailabilityExceptions,
  formatAvailabilityException,
  getAvailabilityKindOptions,
  getEventsForDate,
  getMonthGrid,
  getWeekDays,
  QUICK_ACTIONS,
  toDateInputValue,
  validateAvailabilityException,
} from "../../lib/availability"
import {
  getBusinessSettings,
  listAdminTreatments,
  listAvailabilityExceptions,
  setAvailabilityExceptionStatus,
  upsertAvailabilityException,
} from "../../lib/supabase/database"

const CALENDAR_VIEWS = {
  MONTH: "MONTH",
  WEEK: "WEEK",
  DAY: "DAY",
}

function getDayHeading(date, view) {
  if (view === CALENDAR_VIEWS.DAY) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
  }

  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

function AvailabilityTypePill({ kind }) {
  const config = AVAILABILITY_KIND_CONFIG[kind]

  return <span className={`admin-availability-pill admin-availability-pill--${config.colorClass}`}>{config.label}</span>
}

function formatEngineReason(reason) {
  if (!reason) return ""

  return reason.replaceAll("_", " ").toLowerCase()
}

function AdminAvailability() {
  const { setIsMobileEditing } = useOutletContext()
  const [records, setRecords] = useState([])
  const [businessSettings, setBusinessSettings] = useState(null)
  const [treatments, setTreatments] = useState([])
  const [filters, setFilters] = useState(DEFAULT_AVAILABILITY_FILTERS)
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEWS.MONTH)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [formValues, setFormValues] = useState({
    ...DEFAULT_AVAILABILITY_FORM,
    startDate: toDateInputValue(new Date()),
    endDate: toDateInputValue(new Date()),
  })
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false)
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [testSelection, setTestSelection] = useState({
    treatmentId: "",
    optionId: "",
    date: toDateInputValue(new Date()),
  })
  const firstFieldRef = useRef(null)

  useEffect(() => {
    const loadAvailabilityData = async () => {
      setIsLoading(true)
      const [{ data: exceptionsData, error: exceptionsError }, { data: settingsData }, { data: treatmentsData }] = await Promise.all([
        listAvailabilityExceptions(),
        getBusinessSettings(),
        listAdminTreatments(),
      ])

      if (exceptionsError || !exceptionsData) {
        setFeedback("We couldn't load availability exceptions just now.")
        setIsLoading(false)
        return
      }

      setRecords(exceptionsData)
      setBusinessSettings(settingsData ?? null)
      setTreatments(treatmentsData ?? [])
      if ((treatmentsData ?? []).length > 0) {
        const defaultTreatment = treatmentsData[0]
        setTestSelection((current) => ({
          ...current,
          treatmentId: defaultTreatment.id,
          optionId: defaultTreatment.options?.[0]?.id ?? "",
        }))
      }
      setIsLoading(false)
    }

    loadAvailabilityData()
  }, [])

  useEffect(() => {
    setIsMobileEditing(isMobileEditorOpen)

    return () => {
      setIsMobileEditing(false)
    }
  }, [isMobileEditorOpen, setIsMobileEditing])

  useEffect(() => {
    if (isMobileEditorOpen) {
      window.requestAnimationFrame(() => {
        firstFieldRef.current?.focus()
        firstFieldRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
      })
    }
  }, [isMobileEditorOpen])

  const filteredRecords = useMemo(() => filterAvailabilityExceptions(records, filters), [filters, records])
  const formattedRecords = useMemo(() => filteredRecords.map(formatAvailabilityException), [filteredRecords])
  const selectedTestTreatment = useMemo(
    () => treatments.find((treatment) => treatment.id === testSelection.treatmentId) ?? null,
    [testSelection.treatmentId, treatments]
  )
  const selectedTestOption = useMemo(
    () => selectedTestTreatment?.options.find((option) => option.id === testSelection.optionId) ?? selectedTestTreatment?.options?.[0] ?? null,
    [selectedTestTreatment, testSelection.optionId]
  )
  const dailyAvailability = useMemo(() => {
    if (!businessSettings || !selectedTestTreatment || !selectedTestOption || !testSelection.date) {
      return null
    }

    return getDailyAvailability({
      date: testSelection.date,
      businessSettings,
      treatment: selectedTestTreatment,
      treatmentOption: selectedTestOption,
      availabilityExceptions: records,
    })
  }, [businessSettings, records, selectedTestOption, selectedTestTreatment, testSelection.date])

  const visibleCalendarDays = useMemo(() => {
    if (calendarView === CALENDAR_VIEWS.WEEK) {
      return getWeekDays(calendarDate)
    }

    if (calendarView === CALENDAR_VIEWS.DAY) {
      return [calendarDate]
    }

    return getMonthGrid(calendarDate)
  }, [calendarDate, calendarView])

  const activeCalendarEvents = useMemo(
    () => records.filter((record) => record.status === AVAILABILITY_STATUS.ACTIVE),
    [records]
  )
  const upcomingActiveRecords = useMemo(
    () => activeCalendarEvents.map(formatAvailabilityException).slice(0, 4),
    [activeCalendarEvents]
  )

  const openEditor = (nextFormValues) => {
    setFormValues(nextFormValues)
    setErrors({})
    setFeedback("")
    setIsActionMenuOpen(false)
    setIsMobileEditorOpen(true)
  }

  const resetForm = (nextDate = new Date()) => {
    const isoDate = toDateInputValue(nextDate)
    openEditor({
      ...DEFAULT_AVAILABILITY_FORM,
      startDate: isoDate,
      endDate: isoDate,
    })
  }

  const closeEditor = () => {
    setIsActionMenuOpen(false)
    setIsMobileEditorOpen(false)
  }

  const openFromRecord = (record) => {
    openEditor(buildAvailabilityForm(record))
  }

  const openFromDate = (date) => {
    const isoDate = toDateInputValue(date)
    openEditor({
      ...DEFAULT_AVAILABILITY_FORM,
      startDate: isoDate,
      endDate: isoDate,
    })
  }

  const applyQuickAction = (actionId) => {
    const action = QUICK_ACTIONS.find((entry) => entry.id === actionId)
    if (!action) return

    setFormValues(action.build(calendarDate))
    setErrors({})
    setFeedback("")
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setErrors({})
    setFeedback("")
  }

  const handleTestChange = (event) => {
    const { name, value } = event.target

    setTestSelection((current) => {
      if (name === "treatmentId") {
        const nextTreatment = treatments.find((treatment) => treatment.id === value)
        return {
          ...current,
          treatmentId: value,
          optionId: nextTreatment?.options?.[0]?.id ?? "",
        }
      }

      return {
        ...current,
        [name]: value,
      }
    })
  }

  const saveException = async () => {
    const nextErrors = validateAvailabilityException(formValues, records)

    setErrors(nextErrors)

    if (nextErrors.reason || nextErrors.datetime || nextErrors.duplicate) {
      return
    }

    setIsSaving(true)
    setFeedback("")
    setIsActionMenuOpen(false)

    const payload = buildAvailabilityPayload(formValues)
    const { data, error } = await upsertAvailabilityException(payload)

    if (error || !data) {
      setFeedback("We couldn't save this availability exception just now. Please try again.")
      setIsSaving(false)
      return
    }

    setRecords((current) => {
      const remaining = current.filter((record) => record.id !== data.id)
      return [...remaining, data].sort((left, right) => left.start_datetime.localeCompare(right.start_datetime))
    })
    setFormValues(buildAvailabilityForm(data))
    setFeedback(formValues.id ? "Availability exception updated successfully." : "Availability exception created successfully.")
    setIsSaving(false)
  }

  const toggleStatus = async (record) => {
    const nextStatus = record.status === AVAILABILITY_STATUS.ACTIVE ? AVAILABILITY_STATUS.INACTIVE : AVAILABILITY_STATUS.ACTIVE
    const confirmed = window.confirm(
      nextStatus === AVAILABILITY_STATUS.INACTIVE
        ? "Set this availability exception to inactive? It will remain stored for auditing."
        : "Reactivate this availability exception?"
    )

    if (!confirmed) return

    const { data, error } = await setAvailabilityExceptionStatus(record.id, nextStatus)

    if (error || !data) {
      setFeedback("We couldn't update this availability exception just now.")
      return
    }

    setRecords((current) =>
      current.map((entry) => (entry.id === data.id ? data : entry)).sort((left, right) => left.start_datetime.localeCompare(right.start_datetime))
    )

    if (formValues.id === data.id) {
      setFormValues(buildAvailabilityForm(data))
    }

    setFeedback(nextStatus === AVAILABILITY_STATUS.INACTIVE ? "Availability exception deactivated." : "Availability exception reactivated.")
  }

  const moveCalendar = (direction) => {
    const nextDate = new Date(calendarDate)

    if (calendarView === CALENDAR_VIEWS.DAY) {
      nextDate.setDate(nextDate.getDate() + direction)
    } else if (calendarView === CALENDAR_VIEWS.WEEK) {
      nextDate.setDate(nextDate.getDate() + direction * 7)
    } else {
      nextDate.setMonth(nextDate.getMonth() + direction)
    }

    setCalendarDate(nextDate)
  }

  const jumpToQuickRange = (mode) => {
    const today = new Date()

    if (mode === "today") {
      setCalendarView(CALENDAR_VIEWS.DAY)
      setCalendarDate(today)
      return
    }

    if (mode === "tomorrow") {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      setCalendarView(CALENDAR_VIEWS.DAY)
      setCalendarDate(tomorrow)
      return
    }

    setCalendarView(CALENDAR_VIEWS.WEEK)
    setCalendarDate(today)
  }

  const calendarHeading = useMemo(() => {
    if (calendarView === CALENDAR_VIEWS.DAY) {
      return calendarDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    }

    if (calendarView === CALENDAR_VIEWS.WEEK) {
      const weekDays = getWeekDays(calendarDate)

      return `${weekDays[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${weekDays[6].toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    }

    return calendarDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  }, [calendarDate, calendarView])

  const mobileBrowseHidden = isMobileEditorOpen

  return (
    <>
      <Seo
        title="Admin Availability | Retreat by the Mournes"
        description="Administrator availability management."
        path="/admin/availability"
        robots="noindex, nofollow"
      />

      <div className={`admin-panel admin-mobile-editor-page ${mobileBrowseHidden ? "is-mobile-focused" : ""}`}>
        <div className={`admin-mobile-browser-view ${mobileBrowseHidden ? "is-hidden-on-mobile" : ""}`}>
          <div className="admin-panel__header admin-panel__header--stacked">
            <div>
              <h2 className="admin-panel__title">Availability Management</h2>
              <p className="section-copy admin-panel__copy">
                Manage the times when appointment requests should not be accepted.
              </p>
            </div>

            <div className="admin-inline-links" aria-label="Availability actions">
              <button type="button" className="ghost-button" onClick={() => jumpToQuickRange("today")}>
                Today
              </button>
              <button type="button" className="ghost-button" onClick={() => resetForm(calendarDate)}>
                New Exception
              </button>
            </div>
          </div>

          {feedback ? <StatusMessage tone={feedback.includes("couldn't") ? "error" : "success"}>{feedback}</StatusMessage> : null}

          {isLoading ? (
            <LoadingMessage message="Loading your availability calendar..." className="admin-panel__status" />
          ) : (
            <div className="admin-availability-layout">
              <section className="admin-subpanel admin-subpanel--stretch">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Calendar</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Switch between month, week and day views to review your unavailable time.
                    </p>
                  </div>
                </div>

                <div className="admin-mobile-quick-strip" aria-label="Availability quick views">
                  <button type="button" className="ghost-button" onClick={() => jumpToQuickRange("today")}>
                    Today
                  </button>
                  <button type="button" className="ghost-button" onClick={() => jumpToQuickRange("tomorrow")}>
                    Tomorrow
                  </button>
                  <button type="button" className="ghost-button" onClick={() => jumpToQuickRange("week")}>
                    This Week
                  </button>
                </div>

                {upcomingActiveRecords.length > 0 ? (
                  <div className="admin-compact-list admin-compact-list--calendar">
                    {upcomingActiveRecords.map((record) => (
                      <div key={record.id} className="admin-compact-list__item">
                        <strong>{record.reason}</strong>
                        <span>
                          {record.dateLabel} • {record.timeLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="admin-calendar-toolbar">
                  <div className="admin-action-row">
                    <button type="button" className="ghost-button" onClick={() => moveCalendar(-1)}>
                      Previous
                    </button>
                    <button type="button" className="ghost-button" onClick={() => setCalendarDate(new Date())}>
                      Today
                    </button>
                    <button type="button" className="ghost-button" onClick={() => moveCalendar(1)}>
                      Next
                    </button>
                  </div>

                  <h4 className="admin-calendar-heading">{calendarHeading}</h4>

                  <div className="admin-view-toggle">
                    {Object.entries(CALENDAR_VIEWS).map(([, view]) => (
                      <button
                        key={view}
                        type="button"
                        className={`admin-view-toggle__button ${calendarView === view ? "is-active" : ""}`}
                        onClick={() => setCalendarView(view)}
                      >
                        {view.charAt(0) + view.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`admin-calendar-grid admin-calendar-grid--${calendarView.toLowerCase()}`}>
                  {visibleCalendarDays.map((day) => {
                    const dayEvents = getEventsForDate(activeCalendarEvents, day).map(formatAvailabilityException)
                    const isCurrentMonth = day.getMonth() === calendarDate.getMonth()

                    return (
                      <button
                        type="button"
                        key={`${calendarView}-${day.toISOString()}`}
                        className={`admin-calendar-cell ${isCurrentMonth ? "" : "is-muted"}`}
                        onClick={() => openFromDate(day)}
                      >
                        <div className="admin-calendar-cell__header">
                          <span>{getDayHeading(day, calendarView)}</span>
                          <span className="admin-calendar-cell__count">{dayEvents.length}</span>
                        </div>

                        <div className="admin-calendar-events">
                          {dayEvents.length === 0 ? <span className="admin-calendar-empty">No exceptions</span> : null}

                          {dayEvents.map((calendarEvent) => (
                            <div
                              key={calendarEvent.id}
                              className={`admin-calendar-event admin-calendar-event--${calendarEvent.colorClass}`}
                              onClick={(clickEvent) => {
                                clickEvent.stopPropagation()
                                openFromRecord(calendarEvent)
                              }}
                            >
                              <strong>{calendarEvent.label}</strong>
                              <span>{calendarEvent.timeLabel}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="admin-subpanel">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Availability Engine Test Panel</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Choose a treatment and date to inspect generated appointment slots using the scheduling engine.
                    </p>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span className="admin-field__label">Treatment</span>
                    <select className="admin-input" name="treatmentId" value={testSelection.treatmentId} onChange={handleTestChange}>
                      {treatments.map((treatment) => (
                        <option key={treatment.id} value={treatment.id}>
                          {treatment.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Pricing option</span>
                    <select className="admin-input" name="optionId" value={testSelection.optionId} onChange={handleTestChange}>
                      {(selectedTestTreatment?.options ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Date</span>
                    <input className="admin-input" type="date" name="date" value={testSelection.date} onChange={handleTestChange} />
                  </label>
                </div>

                {dailyAvailability ? (
                  <div className="admin-availability-test">
                    {dailyAvailability.reason ? <p className="admin-auth-note">No slots available: {formatEngineReason(dailyAvailability.reason)}.</p> : null}

                    {dailyAvailability.slots.length > 0 ? (
                      <div className="admin-slot-list">
                        {dailyAvailability.slots.map((slot) => (
                          <span key={slot.start.toISOString()} className="admin-slot-pill">
                            {slot.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="section-copy admin-subpanel__copy">No bookable slots are available for the selected treatment and date.</p>
                    )}

                    {dailyAvailability.unavailablePeriods.length > 0 ? (
                      <div className="admin-availability-summary">
                        <h4 className="admin-availability-summary__title">Unavailable periods considered</h4>
                        <div className="admin-availability-summary__list">
                          {dailyAvailability.unavailablePeriods.map((period) => {
                            const formattedPeriod = formatAvailabilityException(period)

                            return (
                              <div key={`${period.id}-${period.start.toISOString()}`} className="admin-availability-summary__item">
                                <AvailabilityTypePill kind={formattedPeriod.kind} />
                                <span>{formattedPeriod.dateLabel}</span>
                                <span>{formattedPeriod.timeLabel}</span>
                                <span>{formattedPeriod.reason}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="section-copy admin-subpanel__copy">Choose a treatment and date to test the engine.</p>
                )}
              </section>

              <section className="admin-subpanel admin-desktop-editor-panel">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">{formValues.id ? "Edit Exception" : "Create Exception"}</h3>
                    <p className="section-copy admin-subpanel__copy">Use quick actions for common unavailable periods, then refine as needed.</p>
                  </div>
                </div>

                <div className="admin-quick-actions">
                  {QUICK_ACTIONS.map((action) => (
                    <button key={action.id} type="button" className="ghost-button" onClick={() => applyQuickAction(action.id)}>
                      {action.label}
                    </button>
                  ))}
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-grid admin-form-grid--two-column">
                    <label className="admin-field">
                      <span className="admin-field__label">Start date</span>
                      <input className="admin-input" type="date" name="startDate" value={formValues.startDate} onChange={handleFormChange} />
                    </label>

                    <label className="admin-field">
                      <span className="admin-field__label">Start time</span>
                      <input className="admin-input" type="time" name="startTime" value={formValues.startTime} onChange={handleFormChange} />
                    </label>

                    <label className="admin-field">
                      <span className="admin-field__label">End date</span>
                      <input className="admin-input" type="date" name="endDate" value={formValues.endDate} onChange={handleFormChange} />
                    </label>

                    <label className="admin-field">
                      <span className="admin-field__label">End time</span>
                      <input className="admin-input" type="time" name="endTime" value={formValues.endTime} onChange={handleFormChange} />
                    </label>
                  </div>

                  <label className="admin-field">
                    <span className="admin-field__label">Type</span>
                    <select className="admin-input" name="kind" value={formValues.kind} onChange={handleFormChange}>
                      {getAvailabilityKindOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Reason</span>
                    <input className="admin-input" name="reason" value={formValues.reason} onChange={handleFormChange} />
                    {errors.reason ? <span className="admin-inline-error">{errors.reason}</span> : null}
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Notes (optional)</span>
                    <textarea className="admin-input admin-textarea" name="notes" value={formValues.notes} onChange={handleFormChange} />
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Status</span>
                    <select className="admin-input" name="status" value={formValues.status} onChange={handleFormChange}>
                      <option value={AVAILABILITY_STATUS.ACTIVE}>Active</option>
                      <option value={AVAILABILITY_STATUS.INACTIVE}>Inactive</option>
                    </select>
                  </label>

                  {errors.datetime ? <p className="admin-inline-error">{errors.datetime}</p> : null}
                  {errors.duplicate ? <p className="admin-inline-error">{errors.duplicate}</p> : null}
                  {errors.pastWarning ? <p className="admin-auth-note">{errors.pastWarning}</p> : null}
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="cta-button" disabled={isSaving} onClick={saveException}>
                    {isSaving ? "Saving exception..." : formValues.id ? "Save Exception" : "Create Exception"}
                  </button>
                  <button type="button" className="ghost-button" onClick={() => resetForm(calendarDate)}>
                    Clear Form
                  </button>
                </div>
              </section>

              <section className="admin-subpanel admin-subpanel--full">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">List View</h3>
                    <p className="section-copy admin-subpanel__copy">Search, filter and sort every availability exception in one place.</p>
                  </div>
                </div>

                <div className="admin-form-grid admin-form-grid--four-column">
                  <label className="admin-field">
                    <span className="admin-field__label">Search reason</span>
                    <input className="admin-input" name="search" value={filters.search} onChange={handleFilterChange} />
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Status</span>
                    <select className="admin-input" name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="ALL">All statuses</option>
                      <option value={AVAILABILITY_STATUS.ACTIVE}>Active</option>
                      <option value={AVAILABILITY_STATUS.INACTIVE}>Inactive</option>
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Type</span>
                    <select className="admin-input" name="kind" value={filters.kind} onChange={handleFilterChange}>
                      <option value="ALL">All types</option>
                      {getAvailabilityKindOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Sort by</span>
                    <select className="admin-input" name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value={AVAILABILITY_SORT_OPTIONS.DATE_ASC}>Date (earliest first)</option>
                      <option value={AVAILABILITY_SORT_OPTIONS.DATE_DESC}>Date (latest first)</option>
                      <option value={AVAILABILITY_SORT_OPTIONS.TYPE_ASC}>Type</option>
                      <option value={AVAILABILITY_SORT_OPTIONS.STATUS_ASC}>Status</option>
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">From date</span>
                    <input className="admin-input" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">To date</span>
                    <input className="admin-input" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                  </label>
                </div>

                {formattedRecords.length === 0 ? (
                  <AdminEmptyState title="No availability exceptions match these filters.">
                    Try clearing a filter or create a new exception for this date range.
                  </AdminEmptyState>
                ) : (
                  <div className="admin-availability-table">
                    <div className="admin-availability-table__head">
                      <span>Date</span>
                      <span>Time</span>
                      <span>Type</span>
                      <span>Reason</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {formattedRecords.map((record) => (
                      <div key={record.id} className="admin-availability-table__row">
                        <span data-label="Date">{record.dateLabel}</span>
                        <span data-label="Time">{record.timeLabel}</span>
                        <span data-label="Type">
                          <AvailabilityTypePill kind={record.kind} />
                        </span>
                        <span data-label="Reason">{record.reason}</span>
                        <span data-label="Status">
                          <span className={`admin-status-pill admin-status-pill--${record.status.toLowerCase()}`}>
                            {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
                          </span>
                        </span>
                        <span className="admin-action-row" data-label="Actions">
                          <button type="button" className="ghost-button" onClick={() => openFromRecord(record)}>
                            Edit
                          </button>
                          <button type="button" className="ghost-button" onClick={() => toggleStatus(record)}>
                            {record.status === AVAILABILITY_STATUS.ACTIVE ? "Deactivate" : "Reactivate"}
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {isMobileEditorOpen ? (
          <div className="admin-mobile-editor-view">
            <AdminEditingHeader
              parentLabel="Availability"
              title={formValues.id ? "Edit Exception" : "Create Exception"}
              onBack={closeEditor}
              onSave={saveException}
              saveLabel="Save"
              isSaving={isSaving}
              menuOpen={isActionMenuOpen}
              onToggleMenu={() => setIsActionMenuOpen((current) => !current)}
              menuLabel="Availability actions"
            >
              <button
                type="button"
                className="admin-editing-menu__item"
                onClick={() => {
                  setIsActionMenuOpen(false)
                  resetForm(calendarDate)
                }}
              >
                Clear Form
              </button>

              {formValues.id ? (
                <button
                  type="button"
                  className="admin-editing-menu__item"
                  onClick={() => {
                    const record = records.find((entry) => entry.id === formValues.id)
                    if (record) {
                      setIsActionMenuOpen(false)
                      toggleStatus(record)
                    }
                  }}
                >
                  {records.find((entry) => entry.id === formValues.id)?.status === AVAILABILITY_STATUS.ACTIVE ? "Deactivate" : "Reactivate"}
                </button>
              ) : null}
            </AdminEditingHeader>

            {feedback ? <StatusMessage tone={feedback.includes("couldn't") ? "error" : "success"}>{feedback}</StatusMessage> : null}

            <section className="admin-subpanel admin-subpanel--editing">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Exception Details</h3>
                  <p className="section-copy admin-subpanel__copy">Use quick actions for common unavailable periods, then refine as needed.</p>
                </div>
              </div>

              <div className="admin-quick-actions">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.id} type="button" className="ghost-button" onClick={() => applyQuickAction(action.id)}>
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="admin-form-grid">
                <label className="admin-field">
                  <span className="admin-field__label">Start date</span>
                  <input
                    ref={firstFieldRef}
                    className="admin-input"
                    type="date"
                    name="startDate"
                    value={formValues.startDate}
                    onChange={handleFormChange}
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Start time</span>
                  <input className="admin-input" type="time" name="startTime" value={formValues.startTime} onChange={handleFormChange} />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">End date</span>
                  <input className="admin-input" type="date" name="endDate" value={formValues.endDate} onChange={handleFormChange} />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">End time</span>
                  <input className="admin-input" type="time" name="endTime" value={formValues.endTime} onChange={handleFormChange} />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Type</span>
                  <select className="admin-input" name="kind" value={formValues.kind} onChange={handleFormChange}>
                    {getAvailabilityKindOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Reason</span>
                  <input className="admin-input" name="reason" value={formValues.reason} onChange={handleFormChange} />
                  {errors.reason ? <span className="admin-inline-error">{errors.reason}</span> : null}
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Notes (optional)</span>
                  <textarea className="admin-input admin-textarea" name="notes" value={formValues.notes} onChange={handleFormChange} />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Status</span>
                  <select className="admin-input" name="status" value={formValues.status} onChange={handleFormChange}>
                    <option value={AVAILABILITY_STATUS.ACTIVE}>Active</option>
                    <option value={AVAILABILITY_STATUS.INACTIVE}>Inactive</option>
                  </select>
                </label>

                {errors.datetime ? <p className="admin-inline-error">{errors.datetime}</p> : null}
                {errors.duplicate ? <p className="admin-inline-error">{errors.duplicate}</p> : null}
                {errors.pastWarning ? <p className="admin-auth-note">{errors.pastWarning}</p> : null}
              </div>
            </section>
          </div>
        ) : null}

        <button
          type="button"
          className={`admin-fab ${mobileBrowseHidden ? "is-hidden" : ""}`}
          onClick={() => resetForm(calendarDate)}
          aria-label="Create new availability exception"
        >
          +
        </button>
      </div>
    </>
  )
}

export default AdminAvailability
