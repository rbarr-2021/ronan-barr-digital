import { useEffect, useState } from "react"
import LoadingMessage from "../../components/LoadingMessage"
import Seo from "../../components/Seo"
import StatusMessage from "../../components/StatusMessage"
import {
  buildBusinessSettingsPayload,
  BUSINESS_DAYS,
  normalizeBusinessSettingsRecord,
  validateBusinessSettings,
} from "../../lib/businessSettings"
import { getBusinessSettings, updateBusinessSettings } from "../../lib/supabase/database"

function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      const { data, error } = await getBusinessSettings()

      if (error || !data) {
        setFeedback("We couldn't load your business settings just now.")
        setSettings(normalizeBusinessSettingsRecord({}))
        setIsLoading(false)
        return
      }

      setSettings(normalizeBusinessSettingsRecord(data))
      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const handleDayChange = (dayKey, field, value) => {
    setSettings((current) => ({
      ...current,
      opening_hours: {
        ...current.opening_hours,
        [dayKey]: {
          ...current.opening_hours[dayKey],
          [field]: value,
        },
      },
    }))
    setErrors((current) => ({ ...current, [dayKey]: undefined }))
    setFeedback("")
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setSettings((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFeedback("")
  }

  const handleClosedToggle = (dayKey, checked) => {
    setSettings((current) => ({
      ...current,
      opening_hours: {
        ...current.opening_hours,
        [dayKey]: {
          ...current.opening_hours[dayKey],
          closed: checked,
          open: checked ? "" : current.opening_hours[dayKey].open,
          close: checked ? "" : current.opening_hours[dayKey].close,
        },
      },
    }))
    setErrors((current) => ({ ...current, [dayKey]: undefined }))
    setFeedback("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateBusinessSettings(settings)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    setErrors({})
    setFeedback("")

    const { data, error } = await updateBusinessSettings(buildBusinessSettingsPayload(settings))

    if (error || !data) {
      setFeedback("We couldn't save your changes just now. Please try again.")
      setIsSaving(false)
      return
    }

    setSettings(normalizeBusinessSettingsRecord(data))
    setFeedback("Business settings updated.")
    setIsSaving(false)
  }

  return (
    <>
      <Seo
        title="Business Settings | Retreat by the Mournes"
        description="Administrator business settings."
        path="/admin/settings"
        robots="noindex, nofollow"
      />

      <div className="admin-panel">
        <div className="admin-panel__header admin-panel__header--stacked">
          <div>
            <h2 className="admin-panel__title">Business Settings</h2>
            <p className="section-copy admin-panel__copy">
              Manage your opening hours, booking rules and default deposit settings in one place.
            </p>
          </div>
        </div>

        {isLoading || !settings ? (
          <LoadingMessage message="Loading your business settings..." className="admin-panel__status" />
        ) : (
          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <section className="admin-subpanel admin-subpanel--full">
              <div className="admin-subpanel__header">
                <h3 className="admin-subpanel__title">Opening Hours</h3>
                <p className="section-copy admin-subpanel__copy">Set when you are available to accept appointment requests.</p>
              </div>

              <div className="admin-opening-hours">
                {BUSINESS_DAYS.map((day) => {
                  const value = settings.opening_hours[day.key]

                  return (
                    <div key={day.key} className="admin-day-row">
                      <div className="admin-day-row__label">
                        <span>{day.label}</span>
                      </div>

                      <div className="admin-day-row__controls">
                        <label className="admin-toggle">
                          <input
                            type="checkbox"
                            checked={value.closed}
                            onChange={(event) => handleClosedToggle(day.key, event.target.checked)}
                          />
                          <span>Closed</span>
                        </label>

                        <input
                          className="admin-input"
                          type="time"
                          value={value.open}
                          disabled={value.closed}
                          onChange={(event) => handleDayChange(day.key, "open", event.target.value)}
                        />

                        <input
                          className="admin-input"
                          type="time"
                          value={value.close}
                          disabled={value.closed}
                          onChange={(event) => handleDayChange(day.key, "close", event.target.value)}
                        />
                      </div>

                      {errors[day.key] ? <p className="admin-inline-error">{errors[day.key]}</p> : null}
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="admin-subpanel">
              <div className="admin-subpanel__header">
                <h3 className="admin-subpanel__title">Booking Rules</h3>
              </div>

              <label className="admin-field">
                <span className="admin-field__label">Booking buffer (minutes)</span>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  name="booking_buffer_minutes"
                  value={settings.booking_buffer_minutes}
                  onChange={handleChange}
                />
                {errors.booking_buffer_minutes ? <span className="admin-inline-error">{errors.booking_buffer_minutes}</span> : null}
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Minimum booking notice (hours)</span>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  name="minimum_notice_hours"
                  value={settings.minimum_notice_hours}
                  onChange={handleChange}
                />
                {errors.minimum_notice_hours ? <span className="admin-inline-error">{errors.minimum_notice_hours}</span> : null}
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Maximum advance booking (days)</span>
                <input
                  className="admin-input"
                  type="number"
                  min="1"
                  name="maximum_booking_days"
                  value={settings.maximum_booking_days}
                  onChange={handleChange}
                />
                {errors.maximum_booking_days ? <span className="admin-inline-error">{errors.maximum_booking_days}</span> : null}
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Appointment gap (minutes)</span>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  name="appointment_gap_minutes"
                  value={settings.appointment_gap_minutes}
                  onChange={handleChange}
                />
                {errors.appointment_gap_minutes ? <span className="admin-inline-error">{errors.appointment_gap_minutes}</span> : null}
              </label>
            </section>

            <section className="admin-subpanel">
              <div className="admin-subpanel__header">
                <h3 className="admin-subpanel__title">Default Deposit</h3>
                <p className="section-copy admin-subpanel__copy">Choose whether your usual deposit is a fixed amount or a percentage.</p>
              </div>

              <label className="admin-field">
                <span className="admin-field__label">Deposit type</span>
                <select
                  className="admin-input"
                  name="default_deposit_type"
                  value={settings.default_deposit_type}
                  onChange={handleChange}
                >
                  <option value="fixed">Fixed amount (&pound;)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </label>

              <label className="admin-field">
                <span className="admin-field__label">
                  Default deposit value {settings.default_deposit_type === "percentage" ? "(%)" : "(£)"}
                </span>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  max={settings.default_deposit_type === "percentage" ? "100" : undefined}
                  step="0.01"
                  name="default_deposit_value"
                  value={settings.default_deposit_value}
                  onChange={handleChange}
                />
                {errors.default_deposit_value ? <span className="admin-inline-error">{errors.default_deposit_value}</span> : null}
              </label>
            </section>

            <div className="admin-form-actions admin-form-actions--sticky-mobile admin-subpanel--full">
              {feedback ? <StatusMessage tone={feedback.includes("couldn't") ? "error" : "success"}>{feedback}</StatusMessage> : null}
              <button type="submit" className="cta-button admin-auth-submit" disabled={isSaving}>
                {isSaving ? "Saving business settings..." : "Save business settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default AdminSettings
