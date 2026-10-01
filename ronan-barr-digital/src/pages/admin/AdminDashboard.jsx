import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AdminEmptyState from "../../components/AdminEmptyState"
import LoadingMessage from "../../components/LoadingMessage"
import Seo from "../../components/Seo"
import { AVAILABILITY_STATUS, formatAvailabilityException, getEventsForDate } from "../../lib/availability"
import {
  BOOKING_STATUS,
  buildBookingCalendarEvent,
  formatBookingDateShort,
  formatBookingTime,
  getBookingStatusMeta,
  isBookingSlotReserved,
} from "../../lib/bookings"
import { getBusinessSettings, listAvailabilityExceptions, listBookings } from "../../lib/supabase/database"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good Morning, Beata"
  }

  if (hour < 18) {
    return "Good Afternoon, Beata"
  }

  return "Good Evening, Beata"
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function formatDayState(settings, activeExceptions, today = new Date()) {
  if (!settings?.opening_hours) {
    return { label: "Unavailable today", tone: "closed" }
  }

  const todayKey = today.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase()
  const hours = settings.opening_hours[todayKey]
  const todayDateKey = getTodayKey(today)

  const holiday = activeExceptions.find(
    (entry) => entry.kind === "HOLIDAY" && entry.start_datetime.slice(0, 10) <= todayDateKey && entry.end_datetime.slice(0, 10) >= todayDateKey
  )
  if (holiday) {
    return { label: "Holiday today", tone: "holiday" }
  }

  const lunch = activeExceptions.find(
    (entry) => entry.kind === "LUNCH_BREAK" && entry.start_datetime.slice(0, 10) <= todayDateKey && entry.end_datetime.slice(0, 10) >= todayDateKey
  )
  if (lunch) {
    return {
      label: `Open today • Lunch ${new Date(lunch.start_datetime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      tone: "open",
    }
  }

  const blocked = activeExceptions.find(
    (entry) => entry.kind === "BLOCKED_TIME" && entry.start_datetime.slice(0, 10) <= todayDateKey && entry.end_datetime.slice(0, 10) >= todayDateKey
  )
  if (blocked) {
    return { label: "Blocked time today", tone: "blocked" }
  }

  if (!hours || hours.closed) {
    return { label: "Closed today", tone: "closed" }
  }

  return { label: `Open until ${hours.close}`, tone: "open" }
}

function buildAttentionItems(bookings, now = new Date()) {
  const items = []

  const pendingReview = bookings.filter((booking) => booking.status === BOOKING_STATUS.PENDING_REVIEW)
  if (pendingReview.length > 0) {
    items.push({
      id: "pending-review",
      title: "Booking requests waiting",
      detail: `${pendingReview.length} request${pendingReview.length === 1 ? "" : "s"} need your review.`,
      actionLabel: "Review",
      link: "/admin/bookings",
    })
  }

  const readyForDeposit = bookings.filter((booking) => booking.status === BOOKING_STATUS.READY_FOR_DEPOSIT)
  if (readyForDeposit.length > 0) {
    items.push({
      id: "ready-deposit",
      title: "Awaiting deposit",
      detail: `${readyForDeposit.length} booking${readyForDeposit.length === 1 ? "" : "s"} are waiting for the deposit request to be completed.`,
      actionLabel: "Open",
      link: "/admin/bookings",
    })
  }

  const suggestedAlternative = bookings.filter((booking) => booking.status === BOOKING_STATUS.PENDING_REVIEW && booking.proposed_start_time)
  if (suggestedAlternative.length > 0) {
    items.push({
      id: "suggested-alternative",
      title: "Alternative time waiting",
      detail: `${suggestedAlternative.length} booking${suggestedAlternative.length === 1 ? "" : "s"} have a suggested new time.`,
      actionLabel: "Review",
      link: "/admin/bookings",
    })
  }

  const expiringSoon = bookings.filter((booking) => {
    if (!isBookingSlotReserved(booking, now) || !booking.slot_locked_until) return false

    const minutesLeft = (new Date(booking.slot_locked_until).getTime() - now.getTime()) / (1000 * 60)
    return minutesLeft > 0 && minutesLeft <= 180
  })

  if (expiringSoon.length > 0) {
    items.push({
      id: "expiring-soon",
      title: "Booking expiring soon",
      detail: `${expiringSoon.length} request${expiringSoon.length === 1 ? "" : "s"} will release soon if not reviewed.`,
      actionLabel: "Review",
      link: "/admin/bookings",
    })
  }

  return items
}

function DashboardStatusPill({ status }) {
  const meta = getBookingStatusMeta(status)

  return <span className={`admin-booking-status-pill admin-booking-status-pill--${meta.colorClass}`}>{meta.label}</span>
}

function AdminDashboard() {
  const [summary, setSummary] = useState({
    isLoading: true,
    openingHours: null,
    exceptions: [],
    bookings: [],
  })

  useEffect(() => {
    let isMounted = true

    const loadSummary = async () => {
      const [{ data: settingsData }, { data: exceptionsData }, { data: bookingsData }] = await Promise.all([
        getBusinessSettings(),
        listAvailabilityExceptions(),
        listBookings(),
      ])

      if (!isMounted) {
        return
      }

      setSummary({
        isLoading: false,
        openingHours: settingsData ?? null,
        exceptions: exceptionsData ?? [],
        bookings: bookingsData ?? [],
      })
    }

    loadSummary()

    return () => {
      isMounted = false
    }
  }, [])

  const activeExceptions = useMemo(
    () => summary.exceptions.filter((record) => record.status === AVAILABILITY_STATUS.ACTIVE),
    [summary.exceptions]
  )
  const todayDateKey = getTodayKey()
  const todayBookings = useMemo(
    () =>
      summary.bookings
        .filter((booking) => booking.requested_date === todayDateKey)
        .sort((left, right) => String(left.start_time).localeCompare(String(right.start_time))),
    [summary.bookings, todayDateKey]
  )
  const nextAppointment = todayBookings[0] ?? null
  const attentionItems = useMemo(() => buildAttentionItems(summary.bookings), [summary.bookings])
  const readyForDeposit = summary.bookings.filter((booking) => booking.status === BOOKING_STATUS.READY_FOR_DEPOSIT)
  const bookingRequests = summary.bookings.filter((booking) => booking.status === BOOKING_STATUS.PENDING_REVIEW)
  const todayAvailability = useMemo(() => formatDayState(summary.openingHours, activeExceptions), [summary.openingHours, activeExceptions])
  const agendaEvents = useMemo(() => {
    const bookingEvents = todayBookings.map(buildBookingCalendarEvent)
    const availabilityEvents = getEventsForDate(activeExceptions.map(formatAvailabilityException), new Date())

    return [...bookingEvents, ...availabilityEvents]
      .sort((left, right) => left.start_datetime.localeCompare(right.start_datetime))
      .slice(0, 6)
  }, [activeExceptions, todayBookings])

  return (
    <>
      <Seo title="Admin Dashboard | Retreat by the Mournes" description="Administrator dashboard." path="/admin" robots="noindex, nofollow" />
      <div className="admin-panel admin-panel--dashboard">
        <div className="admin-dashboard-welcome">
          <p className="admin-kicker">Today&apos;s Overview</p>
          <h2 className="admin-panel__title">{getGreeting()}</h2>
          <p className="section-copy admin-panel__copy">Everything you need for today is here, in priority order.</p>
        </div>

        {summary.isLoading ? (
          <LoadingMessage message="Loading today's dashboard..." className="admin-panel__status" />
        ) : (
          <div className="admin-dashboard-flow">
            <section className="admin-subpanel admin-dashboard-priority-card">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Needs Your Attention</h3>
                  <p className="section-copy admin-subpanel__copy">Start here first.</p>
                </div>
              </div>

              {attentionItems.length > 0 ? (
                <div className="admin-action-stack">
                  {attentionItems.map((item) => (
                    <div key={item.id} className="admin-attention-item">
                      <div>
                        <strong>{item.title}</strong>
                        <p className="section-copy">{item.detail}</p>
                      </div>
                      <Link className="ghost-button admin-attention-item__action" to={item.link}>
                        {item.actionLabel}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminEmptyState title="You're all caught up">No booking requests need your attention right now.</AdminEmptyState>
              )}
            </section>

            <section className="admin-subpanel">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Next Appointment</h3>
                  <p className="section-copy admin-subpanel__copy">Your next booking today.</p>
                </div>
              </div>

              {nextAppointment ? (
                <Link className="admin-action-card admin-dashboard-appointment-card" to="/admin/bookings">
                  <span className="admin-action-card__eyebrow">{formatBookingTime(nextAppointment.start_time)}</span>
                  <strong>{nextAppointment.treatment?.name}</strong>
                  <span>{nextAppointment.client_name}</span>
                  <span>{nextAppointment.treatment_option?.duration_minutes ?? 0} mins</span>
                  <DashboardStatusPill status={nextAppointment.status} />
                </Link>
              ) : (
                <AdminEmptyState title="No appointments today.">You have no appointments scheduled for today.</AdminEmptyState>
              )}
            </section>

            <section className="admin-subpanel">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Today&apos;s Appointments</h3>
                  <p className="section-copy admin-subpanel__copy">Shown in time order.</p>
                </div>
              </div>

              {todayBookings.length > 0 ? (
                <div className="admin-compact-list">
                  {todayBookings.map((booking) => (
                    <Link key={booking.id} className="admin-compact-list__item admin-compact-list__item--link" to="/admin/bookings">
                      <strong>
                        {formatBookingTime(booking.start_time)} {" • "} {booking.treatment?.name}
                      </strong>
                      <span>{booking.client_name}</span>
                      <DashboardStatusPill status={booking.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <AdminEmptyState title="No appointments today.">You have no appointments scheduled for today.</AdminEmptyState>
              )}
            </section>

            <section className="admin-dashboard-grid" aria-label="Dashboard queues">
              <article className="admin-summary-card">
                <p className="admin-summary-card__label">Awaiting Deposit</p>
                <h3 className="admin-summary-card__value">{readyForDeposit.length}</h3>
                <p className="section-copy admin-summary-card__copy">Requests reviewed and waiting for the deposit stage.</p>
                <Link className="ghost-button" to="/admin/bookings">
                  Open
                </Link>
              </article>

              <article className="admin-summary-card">
                <p className="admin-summary-card__label">Booking Requests</p>
                <h3 className="admin-summary-card__value">{bookingRequests.length}</h3>
                <p className="section-copy admin-summary-card__copy">Requests waiting for review.</p>
                <Link className="ghost-button" to="/admin/bookings">
                  Review Requests
                </Link>
              </article>
            </section>

            <section className="admin-dashboard-grid" aria-label="Availability and quick actions">
              <article className="admin-subpanel">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Today&apos;s Availability</h3>
                    <p className="section-copy admin-subpanel__copy">Simple status for the day.</p>
                  </div>
                </div>

                <div className={`admin-availability-status-card admin-availability-status-card--${todayAvailability.tone}`}>
                  <strong>{todayAvailability.label}</strong>
                </div>
              </article>

              <article className="admin-subpanel">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">Quick Actions</h3>
                    <p className="section-copy admin-subpanel__copy">Large buttons for today&apos;s most common tasks.</p>
                  </div>
                </div>

                <div className="admin-quick-action-grid">
                  <Link className="admin-action-card" to="/admin/bookings">
                    <span className="admin-action-card__eyebrow">New</span>
                    <strong>New Appointment</strong>
                  </Link>
                  <Link className="admin-action-card" to="/admin/bookings">
                    <span className="admin-action-card__eyebrow">Requests</span>
                    <strong>Booking Request</strong>
                  </Link>
                  <Link className="admin-action-card" to="/admin/availability">
                    <span className="admin-action-card__eyebrow">Availability</span>
                    <strong>Block Time</strong>
                  </Link>
                  <Link className="admin-action-card" to="/admin/availability">
                    <span className="admin-action-card__eyebrow">Availability</span>
                    <strong>Holiday</strong>
                  </Link>
                  <Link className="admin-action-card" to="/admin/treatments">
                    <span className="admin-action-card__eyebrow">Treatments</span>
                    <strong>Treatment</strong>
                  </Link>
                </div>
              </article>
            </section>

            <section className="admin-subpanel">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Agenda Snapshot</h3>
                  <p className="section-copy admin-subpanel__copy">A compact look at today&apos;s schedule.</p>
                </div>
              </div>

              {agendaEvents.length > 0 ? (
                <div className="admin-compact-list">
                  {agendaEvents.map((event) => (
                    <Link
                      key={`${event.id}-${event.start_datetime}`}
                      className="admin-compact-list__item admin-compact-list__item--link"
                      to={event.colorClass === "blocked" || event.colorClass === "holiday" || event.colorClass === "lunch" ? "/admin/availability" : "/admin/bookings"}
                    >
                      <strong>
                        {new Date(event.start_datetime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {" • "} {event.label}
                      </strong>
                      <span>{event.reason || formatBookingDateShort(event.start_datetime.slice(0, 10))}</span>
                      <span>{event.timeLabel}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <AdminEmptyState title="No appointments today.">
                  You have no appointments or blocked periods scheduled for today.
                </AdminEmptyState>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminDashboard
