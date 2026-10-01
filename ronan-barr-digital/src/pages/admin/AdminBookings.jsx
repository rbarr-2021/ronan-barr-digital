import { useEffect, useMemo, useState } from "react"
import AdminEmptyState from "../../components/AdminEmptyState"
import LoadingMessage from "../../components/LoadingMessage"
import Seo from "../../components/Seo"
import StatusMessage from "../../components/StatusMessage"
import { formatCurrencyAmount, formatDepositRequirement, getDepositAmountForPrice } from "../../lib/businessSettings"
import { cancelBooking, cancelSecureDepositRequest, createBookingRequest, createSecureDepositRequest, declineBooking, getRequestableSlots, suggestAlternative } from "../../lib/booking-service"
import {
  BOOKING_DEPOSIT_REQUEST_STATUS,
  BOOKING_DEPOSIT_STATUS,
  BOOKING_SOURCE,
  BOOKING_STATUS,
  buildBookingCalendarEvent,
  formatBookingCommunicationSummary,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingTime,
  getBookingCommunicationChannels,
  getBookingDepositRequestStatus,
  getBookingDepositStatusMeta,
  getBookingStatusMeta,
  isDepositRequestExpired,
} from "../../lib/bookings"
import { formatAvailabilityException, getMonthGrid, getEventsForDate, toDateInputValue } from "../../lib/availability"
import {
  getBusinessSettings,
  listAdminTreatments,
  listAvailabilityExceptions,
  listBookingReservations,
  listBookingTimelineEvents,
  listBookings,
} from "../../lib/supabase/database"

function getEmptyManualBooking() {
  return {
    treatmentId: "",
    treatmentOptionId: "",
    requestedDate: toDateInputValue(new Date()),
    startTime: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    whatsappNotifications: false,
    pregnant: "no",
    injuries: "",
    medicalConditions: "",
    anythingElse: "",
    additionalNotes: "",
  }
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

function BookingStatusPill({ status }) {
  const meta = getBookingStatusMeta(status)

  return <span className={`admin-booking-status-pill admin-booking-status-pill--${meta.colorClass}`}>{meta.label}</span>
}

function getDepositStatusForBooking(booking) {
  if (!booking) {
    return BOOKING_DEPOSIT_STATUS.PENDING
  }

  if (booking.status === BOOKING_STATUS.READY_FOR_DEPOSIT && booking.deposit_status === BOOKING_DEPOSIT_STATUS.PENDING) {
    return BOOKING_DEPOSIT_STATUS.PENDING
  }

  return booking.deposit_status
}

function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [businessSettings, setBusinessSettings] = useState(null)
  const [availabilityExceptions, setAvailabilityExceptions] = useState([])
  const [reservations, setReservations] = useState([])
  const [treatments, setTreatments] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [alternativeDate, setAlternativeDate] = useState("")
  const [alternativeSlots, setAlternativeSlots] = useState([])
  const [manualBooking, setManualBooking] = useState(getEmptyManualBooking())
  const [manualSlots, setManualSlots] = useState([])
  const [isCreatingManualBooking, setIsCreatingManualBooking] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [isTimelineLoading, setIsTimelineLoading] = useState(false)

  const loadData = async ({ preserveSelection = true } = {}) => {
    const [
      { data: bookingsData },
      { data: settingsData },
      { data: availabilityData },
      { data: reservationsData },
      { data: treatmentsData },
    ] = await Promise.all([
      listBookings(),
      getBusinessSettings(),
      listAvailabilityExceptions(),
      listBookingReservations(),
      listAdminTreatments(),
    ])

    setBookings(bookingsData ?? [])
    setBusinessSettings(settingsData ?? null)
    setAvailabilityExceptions(availabilityData ?? [])
    setReservations(reservationsData ?? [])
    setTreatments(treatmentsData ?? [])

    if ((bookingsData ?? []).length > 0) {
      setSelectedBookingId((current) => {
        if (!preserveSelection || !current || !(bookingsData ?? []).some((booking) => booking.id === current)) {
          return bookingsData[0].id
        }

        return current
      })
    }

    if ((treatmentsData ?? []).length > 0) {
      const firstTreatment = treatmentsData[0]
      setManualBooking((current) => ({
        ...current,
        treatmentId: current.treatmentId || firstTreatment.id,
        treatmentOptionId: current.treatmentOptionId || firstTreatment.options?.[0]?.id || "",
      }))
    }
  }

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      const [
        { data: bookingsData },
        { data: settingsData },
        { data: availabilityData },
        { data: reservationsData },
        { data: treatmentsData },
      ] = await Promise.all([
        listBookings(),
        getBusinessSettings(),
        listAvailabilityExceptions(),
        listBookingReservations(),
        listAdminTreatments(),
      ])

      if (!isMounted) {
        return
      }

      setBookings(bookingsData ?? [])
      setBusinessSettings(settingsData ?? null)
      setAvailabilityExceptions(availabilityData ?? [])
      setReservations(reservationsData ?? [])
      setTreatments(treatmentsData ?? [])

      if ((bookingsData ?? []).length > 0) {
        setSelectedBookingId(bookingsData[0].id)
      }

      if ((treatmentsData ?? []).length > 0) {
        const firstTreatment = treatmentsData[0]
        setManualBooking((current) => ({
          ...current,
          treatmentId: current.treatmentId || firstTreatment.id,
          treatmentOptionId: current.treatmentOptionId || firstTreatment.options?.[0]?.id || "",
        }))
      }

      setIsLoading(false)
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId]
  )

  const pendingCount = bookings.filter((booking) => booking.status === BOOKING_STATUS.PENDING_REVIEW).length
  const readyCount = bookings.filter((booking) => booking.status === BOOKING_STATUS.READY_FOR_DEPOSIT).length

  const activeBookingEvents = useMemo(
    () =>
      bookings
        .filter((booking) => [BOOKING_STATUS.PENDING_REVIEW, BOOKING_STATUS.READY_FOR_DEPOSIT, BOOKING_STATUS.CONFIRMED].includes(booking.status))
        .map(buildBookingCalendarEvent),
    [bookings]
  )

  const visibleCalendarDays = useMemo(() => getMonthGrid(calendarDate), [calendarDate])

  useEffect(() => {
    const loadAlternativeSlots = async () => {
      if (!selectedBooking || !alternativeDate || !businessSettings) {
        setAlternativeSlots([])
        return
      }

      const slots = await getRequestableSlots({
        requestedDate: alternativeDate,
        treatmentId: selectedBooking.treatment_id,
        treatmentOptionId: selectedBooking.treatment_option_id,
        businessSettings,
        availabilityExceptions,
        reservations,
        excludeBookingId: selectedBooking.id,
      })

      setAlternativeSlots(slots)
    }

    loadAlternativeSlots()
  }, [alternativeDate, availabilityExceptions, businessSettings, reservations, selectedBooking])

  useEffect(() => {
    const loadManualSlots = async () => {
      if (!manualBooking.treatmentId || !manualBooking.treatmentOptionId || !manualBooking.requestedDate || !businessSettings) {
        setManualSlots([])
        return
      }

      const slots = await getRequestableSlots({
        requestedDate: manualBooking.requestedDate,
        treatmentId: manualBooking.treatmentId,
        treatmentOptionId: manualBooking.treatmentOptionId,
        businessSettings,
        availabilityExceptions,
        reservations,
      })

      setManualSlots(slots)
    }

    loadManualSlots()
  }, [availabilityExceptions, businessSettings, manualBooking.requestedDate, manualBooking.treatmentId, manualBooking.treatmentOptionId, reservations])

  const changeManualField = (field, value) => {
    setManualBooking((current) => {
      if (field === "treatmentId") {
        const nextTreatment = treatments.find((entry) => entry.id === value)

        return {
          ...current,
          treatmentId: value,
          treatmentOptionId: nextTreatment?.options?.[0]?.id ?? "",
          startTime: "",
        }
      }

      return {
        ...current,
        [field]: value,
      }
    })
  }

  const handleCreateDepositRequest = async ({ replaceExisting = false } = {}) => {
    if (!selectedBooking) return

    setIsSaving(true)
    setFeedback("")

    try {
      await createSecureDepositRequest({
        bookingId: selectedBooking.id,
        replaceExisting,
      })
      setFeedback("Deposit request created.")
      setIsDepositModalOpen(false)
      await loadData()
    } catch (error) {
      setFeedback(error.message || "We couldn't create a payment link just now.")
    }

    setIsSaving(false)
  }

  const handleCancelDepositRequest = async () => {
    if (!selectedBooking) return

    setIsSaving(true)
    setFeedback("")

    try {
      await cancelSecureDepositRequest({
        bookingId: selectedBooking.id,
      })
      setFeedback("Deposit request cancelled.")
      await loadData()
    } catch (error) {
      setFeedback(error.message || "We couldn't cancel this payment request just now.")
    }

    setIsSaving(false)
  }

  const handleDecline = async () => {
    if (!selectedBooking) return

    setIsSaving(true)
    setFeedback("")

    try {
      await declineBooking({ bookingId: selectedBooking.id })
      setFeedback("Booking declined.")
      await loadData()
    } catch (error) {
      setFeedback(error.message || "We couldn't decline this booking request just now.")
    }

    setIsSaving(false)
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    setIsSaving(true)
    setFeedback("")

    try {
      await cancelBooking({ bookingId: selectedBooking.id })
      setFeedback("Booking cancelled.")
      await loadData()
    } catch (error) {
      setFeedback(error.message || "We couldn't cancel this booking just now.")
    }

    setIsSaving(false)
  }

  const handleSuggestAlternative = async (slot) => {
    if (!selectedBooking) return

    setIsSaving(true)
    setFeedback("")

    try {
      await suggestAlternative({
        bookingId: selectedBooking.id,
        proposedDate: alternativeDate,
        proposedStartTime: slot.label,
        businessSettings,
        availabilityExceptions,
        reservations,
      })
      setFeedback("Alternative appointment suggested.")
      await loadData()
    } catch (error) {
      setFeedback(error.message || "We couldn't save this alternative time just now.")
    }

    setIsSaving(false)
  }

  const handleManualCreate = async () => {
    if (!manualBooking.clientName.trim()) {
      setFeedback("Please enter the client's full name.")
      return
    }

    if (!manualBooking.clientEmail.trim()) {
      setFeedback("Please enter the client's email address.")
      return
    }

    if (!isValidEmailAddress(manualBooking.clientEmail)) {
      setFeedback("Please enter a valid email address.")
      return
    }

    if (!manualBooking.clientPhone.trim()) {
      setFeedback("Please enter the client's mobile number.")
      return
    }

    setIsSaving(true)
    setFeedback("")

    try {
      await createBookingRequest({
        treatmentId: manualBooking.treatmentId,
        treatmentOptionId: manualBooking.treatmentOptionId,
        requestedDate: manualBooking.requestedDate,
        startTime: manualBooking.startTime,
        clientName: manualBooking.clientName,
        clientEmail: manualBooking.clientEmail,
        clientPhone: manualBooking.clientPhone,
        whatsappNotifications: manualBooking.whatsappNotifications,
        healthInformation: {
          pregnant: manualBooking.pregnant,
          injuries: manualBooking.injuries,
          medicalConditions: manualBooking.medicalConditions,
          anythingElse: manualBooking.anythingElse,
        },
        additionalNotes: manualBooking.additionalNotes,
        source: BOOKING_SOURCE.ADMINISTRATOR,
        businessSettings,
        availabilityExceptions,
        reservations,
      })

      setFeedback("Booking request saved.")
      setManualBooking(getEmptyManualBooking())
      setIsCreatingManualBooking(false)
      await loadData()
    } catch (error) {
      setFeedback(error.message || "We couldn't save this booking request just now.")
    }

    setIsSaving(false)
  }

  const selectedManualTreatment = treatments.find((treatment) => treatment.id === manualBooking.treatmentId) ?? null
  const selectedManualOption = selectedManualTreatment?.options?.find((option) => option.id === manualBooking.treatmentOptionId) ?? null
  const manualDepositDisplay = formatDepositRequirement(businessSettings, selectedManualOption?.price ?? null)
  const selectedBookingPrice = Number(selectedBooking?.treatment_option?.price ?? 0)
  const selectedBookingDepositAmount = Number(selectedBooking?.deposit_amount ?? getDepositAmountForPrice(businessSettings, selectedBookingPrice))
  const selectedBookingDepositDisplay = selectedBooking?.deposit_amount
    ? formatCurrencyAmount(selectedBooking.deposit_amount)
    : formatDepositRequirement(businessSettings, selectedBookingPrice || null)
  const selectedBookingStatusMeta = selectedBooking ? getBookingStatusMeta(selectedBooking.status) : null
  const selectedBookingDepositMeta = selectedBooking ? getBookingDepositStatusMeta(getDepositStatusForBooking(selectedBooking)) : null
  const selectedBookingCommunicationChannels = selectedBooking ? getBookingCommunicationChannels(selectedBooking) : []
  const selectedBookingDepositRequestStatus = selectedBooking ? getBookingDepositRequestStatus(selectedBooking) : BOOKING_DEPOSIT_REQUEST_STATUS.NONE
  const selectedBookingRemainingBalance = Math.max(selectedBookingPrice - (selectedBooking?.deposit_amount ?? selectedBookingDepositAmount ?? 0), 0)
  const hasActiveDepositLink = selectedBookingDepositRequestStatus === BOOKING_DEPOSIT_REQUEST_STATUS.ACTIVE && Boolean(selectedBooking?.square_checkout_url)
  const hasExpiredDepositLink = selectedBookingDepositRequestStatus === BOOKING_DEPOSIT_REQUEST_STATUS.EXPIRED || isDepositRequestExpired(selectedBooking)

  useEffect(() => {
    const loadTimeline = async () => {
      if (!selectedBookingId) {
        setTimelineEvents([])
        return
      }

      setIsTimelineLoading(true)
      const { data } = await listBookingTimelineEvents(selectedBookingId)
      setTimelineEvents(data ?? [])
      setIsTimelineLoading(false)
    }

    loadTimeline()
  }, [selectedBookingId, bookings])

  const copyDepositLink = async () => {
    if (!selectedBooking?.square_checkout_url) return

    try {
      await navigator.clipboard.writeText(selectedBooking.square_checkout_url)
      setFeedback("Payment link copied.")
    } catch {
      setFeedback("We couldn't copy the payment link just now.")
    }
  }

  return (
    <>
      <Seo title="Admin Bookings | Retreat by the Mournes" description="Administrator bookings area." path="/admin/bookings" robots="noindex, nofollow" />
      <div className="admin-panel">
        <div className="admin-panel__header admin-panel__header--stacked">
          <div>
            <h2 className="admin-panel__title">Booking Requests</h2>
            <p className="section-copy admin-panel__copy">
              Review new requests, request the deposit for the ones you want to accept, or suggest a better appointment time.
            </p>
          </div>

          <div className="admin-inline-links">
            <button type="button" className="ghost-button" onClick={() => setIsCreatingManualBooking((current) => !current)}>
              {isCreatingManualBooking ? "Close Manual Booking" : "New Booking Request"}
            </button>
          </div>
        </div>

        {feedback ? <StatusMessage tone={feedback.includes("couldn't") ? "error" : "success"}>{feedback}</StatusMessage> : null}

        {isLoading ? (
          <LoadingMessage message="Loading booking requests..." className="admin-panel__status" />
        ) : (
          <>
            <section className="admin-dashboard-summary">
              <article className="admin-summary-card">
                <p className="admin-summary-card__label">Pending Review</p>
                <h3 className="admin-summary-card__value">{pendingCount}</h3>
                <p className="section-copy admin-summary-card__copy">Requests waiting for your review.</p>
              </article>
              <article className="admin-summary-card">
                <p className="admin-summary-card__label">Awaiting Deposit</p>
                <h3 className="admin-summary-card__value">{readyCount}</h3>
                <p className="section-copy admin-summary-card__copy">Requests reviewed and waiting for the deposit request to be completed.</p>
              </article>
              <article className="admin-summary-card">
                <p className="admin-summary-card__label">Total Requests</p>
                <h3 className="admin-summary-card__value">{bookings.length}</h3>
                <p className="section-copy admin-summary-card__copy">Every booking request currently in your inbox.</p>
              </article>
            </section>

            {isCreatingManualBooking ? (
              <section className="admin-subpanel admin-subpanel--full">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Manual Booking Request</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Create a booking request for a client using the same booking rules as the website.
                    </p>
                  </div>
                </div>

                <div className="admin-form-grid admin-form-grid--two-column">
                  <label className="admin-field">
                    <span className="admin-field__label">Treatment</span>
                    <select className="admin-input" value={manualBooking.treatmentId} onChange={(event) => changeManualField("treatmentId", event.target.value)}>
                      {treatments.map((treatment) => (
                        <option key={treatment.id} value={treatment.id}>
                          {treatment.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Duration</span>
                    <select className="admin-input" value={manualBooking.treatmentOptionId} onChange={(event) => changeManualField("treatmentOptionId", event.target.value)}>
                      {(selectedManualTreatment?.options ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedManualOption ? (
                    <article className="admin-compact-list__item admin-field admin-field--full">
                      <strong>Treatment Summary</strong>
                      <span>Price: {formatCurrencyAmount(selectedManualOption.price ?? 0)}</span>
                      <span>Deposit required: {manualDepositDisplay}</span>
                    </article>
                  ) : null}

                  <label className="admin-field">
                    <span className="admin-field__label">Preferred date</span>
                    <input className="admin-input" type="date" value={manualBooking.requestedDate} onChange={(event) => changeManualField("requestedDate", event.target.value)} />
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Available time</span>
                    <select className="admin-input" value={manualBooking.startTime} onChange={(event) => changeManualField("startTime", event.target.value)}>
                      <option value="">Choose a time</option>
                      {manualSlots.map((slot) => (
                        <option key={slot.start.toISOString()} value={slot.label}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Full name</span>
                    <input className="admin-input" value={manualBooking.clientName} onChange={(event) => changeManualField("clientName", event.target.value)} />
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Email address</span>
                    <input className="admin-input" type="email" value={manualBooking.clientEmail} onChange={(event) => changeManualField("clientEmail", event.target.value)} />
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Mobile number</span>
                    <input className="admin-input" value={manualBooking.clientPhone} onChange={(event) => changeManualField("clientPhone", event.target.value)} />
                  </label>

                  <div className="admin-field admin-field--full">
                    <span className="admin-field__label">Communication Preferences</span>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--text-dark)", fontSize: "15px", lineHeight: "1.6" }}>
                      <input
                        type="checkbox"
                        checked={manualBooking.whatsappNotifications}
                        onChange={(event) => changeManualField("whatsappNotifications", event.target.checked)}
                        style={{ marginTop: "4px" }}
                      />
                      <span>Keep this client updated on WhatsApp about this booking.</span>
                    </label>
                    <p className="section-copy admin-subpanel__copy" style={{ margin: 0 }}>
                      WhatsApp updates are limited to this booking only, such as confirmation, deposit requests and reminders.
                    </p>
                  </div>

                  <label className="admin-field">
                    <span className="admin-field__label">Are they pregnant?</span>
                    <select className="admin-input" value={manualBooking.pregnant} onChange={(event) => changeManualField("pregnant", event.target.value)}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </label>

                  <label className="admin-field admin-field--full">
                    <span className="admin-field__label">Injuries</span>
                    <textarea className="admin-input admin-textarea" value={manualBooking.injuries} onChange={(event) => changeManualField("injuries", event.target.value)} />
                  </label>

                  <label className="admin-field admin-field--full">
                    <span className="admin-field__label">Medical conditions</span>
                    <textarea className="admin-input admin-textarea" value={manualBooking.medicalConditions} onChange={(event) => changeManualField("medicalConditions", event.target.value)} />
                  </label>

                  <label className="admin-field admin-field--full">
                    <span className="admin-field__label">Anything else Beata should know?</span>
                    <textarea className="admin-input admin-textarea" value={manualBooking.anythingElse} onChange={(event) => changeManualField("anythingElse", event.target.value)} />
                  </label>

                  <label className="admin-field admin-field--full">
                    <span className="admin-field__label">Additional notes</span>
                    <textarea className="admin-input admin-textarea" value={manualBooking.additionalNotes} onChange={(event) => changeManualField("additionalNotes", event.target.value)} />
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="cta-button" onClick={handleManualCreate} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Booking Request"}
                  </button>
                </div>
              </section>
            ) : null}

            <div className="admin-bookings-layout">
              <section className="admin-subpanel">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Booking Queue</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Newest requests appear first. Select one to review the details.
                    </p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <AdminEmptyState title="No booking requests yet.">
                    New booking requests will appear here as soon as a client sends one.
                  </AdminEmptyState>
                ) : (
                  <div className="admin-booking-queue">
                    {bookings.map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        className={`admin-booking-card ${selectedBookingId === booking.id ? "is-active" : ""}`}
                        onClick={() => setSelectedBookingId(booking.id)}
                      >
                        <div className="admin-booking-card__header">
                          <strong>{booking.treatment?.name ?? "Booking request"}</strong>
                          <BookingStatusPill status={booking.status} />
                        </div>
                        <div className="admin-booking-card__meta">
                          <span>{formatBookingDate(booking.requested_date)}</span>
                          <span>{formatBookingTime(booking.start_time)}</span>
                          <span>{booking.client_name}</span>
                          <span>{formatBookingCommunicationSummary(booking)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-subpanel admin-subpanel--stretch">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Review Request</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Focus on what needs to happen next: request the deposit, suggest another time, or decline.
                    </p>
                  </div>
                </div>

                {!selectedBooking ? (
                  <AdminEmptyState title="Choose a booking request.">
                    Select a request from the queue to review it here.
                  </AdminEmptyState>
                ) : (
                  <div className="admin-booking-detail">
                    <div className="admin-dashboard-grid">
                      <article className="admin-compact-list__item">
                        <strong>Customer</strong>
                        <span>{selectedBooking.client_name}</span>
                        <span>{selectedBooking.client_email}</span>
                        <span>{selectedBooking.client_phone}</span>
                        <span>{formatBookingCommunicationSummary(selectedBooking)}</span>
                      </article>

                      <article className="admin-compact-list__item">
                        <strong>Treatment</strong>
                        <span>{selectedBooking.treatment?.name}</span>
                        <span>{selectedBooking.treatment_option?.label}</span>
                        <span>Source: {selectedBooking.source === BOOKING_SOURCE.ADMINISTRATOR ? "Administrator" : "Website"}</span>
                      </article>

                      <article className="admin-compact-list__item">
                        <strong>Booking Status</strong>
                        <span>{selectedBookingStatusMeta?.label}</span>
                        <span>Deposit status: {selectedBookingDepositMeta?.label}</span>
                      </article>

                      <article className="admin-compact-list__item">
                        <strong>Appointment</strong>
                        <span>{formatBookingDate(selectedBooking.requested_date)}</span>
                        <span>
                          {formatBookingTime(selectedBooking.start_time)} - {formatBookingTime(selectedBooking.end_time)}
                        </span>
                        {selectedBooking.proposed_start_time ? (
                          <span>
                            Suggested: {new Date(selectedBooking.proposed_start_time).toLocaleDateString("en-GB")}{" "}
                            {new Date(selectedBooking.proposed_start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : null}
                      </article>

                      <article className="admin-compact-list__item">
                        <strong>Pricing</strong>
                        <span>Treatment price: {selectedBooking.treatment_option ? formatCurrencyAmount(selectedBooking.treatment_option.price ?? 0) : "Not available"}</span>
                        <span>Deposit required: {selectedBookingDepositDisplay}</span>
                      </article>

                      <article className="admin-compact-list__item">
                        <strong>Communication</strong>
                        {selectedBookingCommunicationChannels.map((channel) => (
                          <span key={channel.key}>
                            {channel.icon} {channel.label}: {channel.detail}
                          </span>
                        ))}
                      </article>

                      <article className="admin-compact-list__item">
                        <strong>Health Information</strong>
                        <span>Pregnant: {selectedBooking.health_information.pregnant}</span>
                        <span>Injuries: {selectedBooking.health_information.injuries || "None provided"}</span>
                        <span>Medical conditions: {selectedBooking.health_information.medicalConditions || "None provided"}</span>
                        <span>Anything else: {selectedBooking.health_information.anythingElse || "None provided"}</span>
                      </article>
                    </div>

                    {selectedBooking.additional_notes ? (
                      <article className="admin-compact-list__item">
                        <strong>Additional Notes</strong>
                        <span>{selectedBooking.additional_notes}</span>
                      </article>
                    ) : null}

                    <article className="admin-compact-list__item">
                      <strong>Deposit Request</strong>
                      <span>Status: {hasExpiredDepositLink ? "Deposit Link Expired" : selectedBookingDepositMeta?.label}</span>
                      <span>Created: {selectedBooking.deposit_requested_at ? formatBookingDateTime(selectedBooking.deposit_requested_at) : "Not created yet"}</span>
                      <span>Expires: {selectedBooking.deposit_expires_at ? formatBookingDateTime(selectedBooking.deposit_expires_at) : "Not set"}</span>
                      <span>Reference: {selectedBooking.payment_reference || "Not created yet"}</span>
                      <span>Remaining balance: {formatCurrencyAmount(selectedBookingRemainingBalance)}</span>
                    </article>

                    <div className="admin-form-actions">
                      {!hasActiveDepositLink ? (
                        <button
                          type="button"
                          className="cta-button"
                          onClick={() => setIsDepositModalOpen(true)}
                          disabled={isSaving || selectedBooking.deposit_status === BOOKING_DEPOSIT_STATUS.PAID}
                        >
                          {isSaving
                            ? "Saving..."
                            : hasExpiredDepositLink || selectedBookingDepositRequestStatus === BOOKING_DEPOSIT_REQUEST_STATUS.CANCELLED
                              ? "Create New Payment Link"
                              : "Create Secure Deposit Request"}
                        </button>
                      ) : null}
                      {hasActiveDepositLink ? (
                        <button type="button" className="ghost-button" onClick={copyDepositLink}>
                          Copy Payment Link
                        </button>
                      ) : null}
                      {hasActiveDepositLink ? (
                        <a className="ghost-button" href={selectedBooking.square_checkout_url} target="_blank" rel="noopener noreferrer">
                          Open Checkout
                        </a>
                      ) : null}
                      {hasActiveDepositLink ? (
                        <button type="button" className="ghost-button" onClick={handleCancelDepositRequest} disabled={isSaving}>
                          Cancel Deposit Request
                        </button>
                      ) : null}
                      {hasExpiredDepositLink ? (
                        <button type="button" className="ghost-button" onClick={handleCancelBooking} disabled={isSaving}>
                          Cancel Booking
                        </button>
                      ) : null}
                      <button type="button" className="ghost-button" onClick={handleDecline} disabled={isSaving}>
                        Decline Request
                      </button>
                    </div>

                    <div className="admin-subpanel admin-subpanel--nested">
                      <div className="admin-subpanel__header">
                        <div>
                          <h4 className="admin-subpanel__title">Audit Timeline</h4>
                          <p className="section-copy admin-subpanel__copy">
                            Every deposit and booking milestone is captured here.
                          </p>
                        </div>
                      </div>

                      {isTimelineLoading ? (
                        <LoadingMessage message="Loading booking timeline..." className="admin-panel__status" />
                      ) : timelineEvents.length === 0 ? (
                        <AdminEmptyState title="No timeline entries yet.">
                          Timeline updates will appear here as this booking moves forward.
                        </AdminEmptyState>
                      ) : (
                        <div className="admin-compact-list">
                          {timelineEvents.map((event) => (
                            <article key={event.id} className="admin-compact-list__item">
                              <strong>{event.title}</strong>
                              {event.description ? <span>{event.description}</span> : null}
                              <span>{formatBookingDateTime(event.created_at)}</span>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="admin-subpanel admin-subpanel--nested">
                      <div className="admin-subpanel__header">
                        <div>
                          <h4 className="admin-subpanel__title">Suggest Another Time</h4>
                          <p className="section-copy admin-subpanel__copy">
                            Choose another available appointment time if the original slot no longer suits.
                          </p>
                        </div>
                      </div>

                      <div className="admin-form-grid admin-form-grid--two-column">
                        <label className="admin-field">
                          <span className="admin-field__label">Alternative date</span>
                          <input className="admin-input" type="date" value={alternativeDate} onChange={(event) => setAlternativeDate(event.target.value)} />
                        </label>
                      </div>

                      {alternativeSlots.length > 0 ? (
                        <div className="admin-slot-list">
                          {alternativeSlots.map((slot) => (
                            <button key={slot.start.toISOString()} type="button" className="admin-slot-pill" onClick={() => handleSuggestAlternative(slot)}>
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      ) : alternativeDate ? (
                        <p className="section-copy admin-subpanel__copy">No alternative times are available for that date.</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <section className="admin-subpanel admin-subpanel--full">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Booking Calendar</h3>
                  <p className="section-copy admin-subpanel__copy">
                    Yellow shows requests waiting for review, amber shows requests awaiting deposit, and red shows blocked availability.
                  </p>
                </div>
              </div>

              <div className="admin-calendar-toolbar">
                <div className="admin-action-row">
                  <button type="button" className="ghost-button" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                    Previous
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setCalendarDate(new Date())}>
                    Today
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                    Next
                  </button>
                </div>

                <h4 className="admin-calendar-heading">
                  {calendarDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </h4>
              </div>

              <div className="admin-calendar-grid admin-calendar-grid--month">
                {visibleCalendarDays.map((day) => {
                  const bookingEvents = getEventsForDate(activeBookingEvents, day)
                  const availabilityEvents = getEventsForDate(availabilityExceptions.map(formatAvailabilityException), day)
                  const combinedEvents = [...bookingEvents, ...availabilityEvents].slice(0, 4)
                  const isCurrentMonth = day.getMonth() === calendarDate.getMonth()

                  return (
                    <div key={day.toISOString()} className={`admin-calendar-cell ${isCurrentMonth ? "" : "is-muted"}`}>
                      <div className="admin-calendar-cell__header">
                        <span>{day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                        <span className="admin-calendar-cell__count">{combinedEvents.length}</span>
                      </div>

                      <div className="admin-calendar-events">
                        {combinedEvents.length === 0 ? <span className="admin-calendar-empty">No items</span> : null}
                        {combinedEvents.map((event) => (
                          <div key={`${event.id}-${event.start_datetime}`} className={`admin-calendar-event admin-calendar-event--${event.colorClass}`}>
                            <strong>{event.label}</strong>
                            <span>{event.timeLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {isDepositModalOpen && selectedBooking ? (
        <div className="admin-preview-sheet" role="dialog" aria-modal="true" aria-labelledby="deposit-request-title">
          <div className="admin-preview-sheet__backdrop" onClick={() => setIsDepositModalOpen(false)} />
          <div className="admin-preview-sheet__panel">
            <div className="admin-preview-sheet__header">
              <div>
                <p className="admin-kicker">Create Secure Deposit Request</p>
                <h3 id="deposit-request-title" className="admin-subpanel__title">Deposit to Confirm Your Retreat</h3>
                <p className="section-copy admin-subpanel__copy">
                  Review the payment summary before creating the secure Square checkout.
                </p>
              </div>

              <button type="button" className="ghost-button" onClick={() => setIsDepositModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="admin-form-grid">
              <article className="admin-compact-list__item">
                <strong>Customer</strong>
                <span>{selectedBooking.client_name}</span>
                <span>{selectedBooking.client_email}</span>
              </article>

              <article className="admin-compact-list__item">
                <strong>Treatment</strong>
                <span>{selectedBooking.treatment?.name}</span>
                <span>{selectedBooking.treatment_option?.label}</span>
              </article>

              <article className="admin-compact-list__item">
                <strong>Treatment Price</strong>
                <span>{formatCurrencyAmount(selectedBookingPrice)}</span>
              </article>

              <article className="admin-compact-list__item">
                <strong>Deposit to Confirm Your Retreat</strong>
                <span>{selectedBookingDepositDisplay}</span>
              </article>

              <article className="admin-compact-list__item">
                <strong>Remaining Balance</strong>
                <span>{formatCurrencyAmount(selectedBookingRemainingBalance)}</span>
                <span>Payable after your appointment.</span>
              </article>
            </div>

            <div className="admin-form-actions">
              <button type="button" className="ghost-button" onClick={() => setIsDepositModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="cta-button"
                onClick={() => handleCreateDepositRequest({ replaceExisting: hasActiveDepositLink || hasExpiredDepositLink })}
                disabled={isSaving}
              >
                {isSaving ? "Creating..." : "Create Secure Payment Link"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default AdminBookings
