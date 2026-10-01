import { useEffect, useMemo, useRef, useState } from "react"
import { useOutletContext } from "react-router-dom"
import AdminEditingHeader from "../../components/AdminEditingHeader"
import LoadingMessage from "../../components/LoadingMessage"
import Seo from "../../components/Seo"
import StatusMessage from "../../components/StatusMessage"
import { useAuth } from "../../components/useAuth"
import { getBusinessSettings, listAdminTreatments, saveTreatmentWithOptions } from "../../lib/supabase/database"
import {
  buildTreatmentSavePayload,
  FACIAL_TREATMENT_NAME,
  FEATURED_INTRODUCTION,
  FEATURED_TREATMENT_NAME,
  formatCurrency,
  getEmptyTreatmentDraft,
  normalizeTreatmentRecord,
  TREATMENT_STATUS,
  validateTreatmentInput,
} from "../../lib/treatments"

function StatusBadge({ status }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase()

  return <span className={`admin-status-pill admin-status-pill--${status.toLowerCase()}`}>{label}</span>
}

function TreatmentPreview({ draft, previewOptions }) {
  return (
    <article className={`admin-treatment-preview ${draft.featured ? "is-featured" : ""}`}>
      {draft.name === FACIAL_TREATMENT_NAME ? (
        <div className="treatment-card__eyebrow-row">
          <span className="treatment-card__eyebrow">Facial Treatment</span>
          <span className="treatment-new-badge">New</span>
        </div>
      ) : null}

      {draft.name === FEATURED_TREATMENT_NAME ? (
        <div className="featured-label-row">
          Signature Treatment
          <span className="treatment-new-badge">New</span>
        </div>
      ) : null}

      <h3 className="admin-treatment-preview__title">{draft.name || "Untitled treatment"}</h3>
      {draft.name === FEATURED_TREATMENT_NAME ? <p className="featured-intro">{FEATURED_INTRODUCTION}</p> : null}
      <p className="section-copy">{draft.description || "Add a treatment description to see the preview."}</p>
      <div className="admin-treatment-preview__options">
        {previewOptions.map((option) => (
          <span key={option.id} className="admin-status-pill">
            {option.label} | {formatCurrency(option.price)}
          </span>
        ))}
      </div>
      <div className="admin-treatment-preview__meta">
        <p className="admin-auth-note">Created: {draft.created_at ? new Date(draft.created_at).toLocaleString() : "Not yet saved"}</p>
        <p className="admin-auth-note">Updated: {draft.updated_at ? new Date(draft.updated_at).toLocaleString() : "Not yet saved"}</p>
        <p className="admin-auth-note">Published: {draft.published_at ? new Date(draft.published_at).toLocaleString() : "Not yet published"}</p>
      </div>
    </article>
  )
}

function AdminTreatments() {
  const { user } = useAuth()
  const { setIsMobileEditing } = useOutletContext()
  const [treatments, setTreatments] = useState([])
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [defaultDepositValue, setDefaultDepositValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [errors, setErrors] = useState({})
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false)
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const firstFieldRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const [{ data: treatmentData }, { data: settingsData }] = await Promise.all([listAdminTreatments(), getBusinessSettings()])

      const nextTreatments = treatmentData ?? []
      const depositValue = Number(settingsData?.default_deposit_value ?? 0)

      setTreatments(nextTreatments)
      setDefaultDepositValue(depositValue)

      if (nextTreatments.length > 0) {
        setSelectedTreatmentId(nextTreatments[0].id)
        setDraft(normalizeTreatmentRecord(nextTreatments[0]))
      } else {
        setSelectedTreatmentId("new")
        setDraft(getEmptyTreatmentDraft(depositValue))
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    setIsMobileEditing(isMobileEditorOpen || isPreviewOpen)

    return () => {
      setIsMobileEditing(false)
    }
  }, [isMobileEditorOpen, isPreviewOpen, setIsMobileEditing])

  useEffect(() => {
    if (isMobileEditorOpen) {
      window.requestAnimationFrame(() => {
        firstFieldRef.current?.focus()
        firstFieldRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
      })
    }
  }, [isMobileEditorOpen])

  const activeTreatment = useMemo(
    () => treatments.find((treatment) => treatment.id === selectedTreatmentId) ?? null,
    [selectedTreatmentId, treatments]
  )

  const updateDraft = (updater) => {
    setDraft((current) => (typeof updater === "function" ? updater(current) : updater))
    setErrors({})
    setFeedback("")
  }

  const openEditor = (nextDraft, nextId) => {
    setSelectedTreatmentId(nextId)
    setDraft(nextDraft)
    setErrors({})
    setFeedback("")
    setIsActionMenuOpen(false)
    setIsPreviewOpen(false)
    setIsMobileEditorOpen(true)
  }

  const selectTreatment = (treatment) => {
    openEditor(normalizeTreatmentRecord(treatment), treatment.id)
  }

  const createNewTreatment = () => {
    openEditor(getEmptyTreatmentDraft(defaultDepositValue), "new")
  }

  const closeEditor = () => {
    setIsActionMenuOpen(false)
    setIsPreviewOpen(false)
    setIsMobileEditorOpen(false)
  }

  const handleFieldChange = (event) => {
    const { name, type, checked, value } = event.target

    updateDraft((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleOptionChange = (optionId, field, value) => {
    updateDraft((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              [field]: value,
            }
          : option
      ),
    }))
  }

  const addOption = () => {
    updateDraft((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          id: `draft-option-${Date.now()}`,
          label: "New option",
          duration_minutes: 60,
          price: 0,
          deposit_amount: defaultDepositValue,
          display_order: (current.options.length + 1) * 10,
        },
      ],
    }))
  }

  const removeOption = (optionId) => {
    if (draft.options.length === 1) {
      setFeedback("Each treatment needs at least one pricing option.")
      return
    }

    if (!window.confirm("Remove this pricing option?")) {
      return
    }

    updateDraft((current) => ({
      ...current,
      options: current.options.filter((option) => option.id !== optionId),
    }))
  }

  const persistTreatment = async (targetStatus = draft.status) => {
    const candidate = {
      ...draft,
      status: targetStatus,
      display_order: Number(draft.display_order),
      options: draft.options.map((option) => ({
        ...option,
        duration_minutes: Number(option.duration_minutes),
        price: Number(option.price),
        deposit_amount: Number(option.deposit_amount),
        display_order: Number(option.display_order),
      })),
    }

    const nextErrors = validateTreatmentInput(candidate, treatments)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    setErrors({})
    setFeedback("")
    setIsActionMenuOpen(false)

    const { treatment, options } = buildTreatmentSavePayload(candidate, user?.id ?? null)
    const { data, error } = await saveTreatmentWithOptions({ treatment, options })

    if (error || !data) {
      setFeedback("We couldn't save this treatment just now. Please try again.")
      setIsSaving(false)
      return
    }

    const normalizedSavedTreatment = normalizeTreatmentRecord(data)
    const refreshedTreatmentsResponse = await listAdminTreatments()
    const refreshedTreatments = refreshedTreatmentsResponse.data ?? []

    setTreatments(refreshedTreatments)
    setSelectedTreatmentId(normalizedSavedTreatment.id)
    setDraft(normalizedSavedTreatment)
    setFeedback(
      targetStatus === TREATMENT_STATUS.DRAFT
        ? "Treatment saved as a draft."
        : targetStatus === TREATMENT_STATUS.INACTIVE
          ? "Treatment has been set to inactive."
          : "Treatment saved successfully."
    )
    setIsSaving(false)
  }

  const previewOptions = draft?.options ?? []
  const isSelectedTreatmentNew = selectedTreatmentId === "new"
  const statusLabel = draft?.status ? draft.status.charAt(0) + draft.status.slice(1).toLowerCase() : "Draft"
  const activeTreatmentCount = treatments.filter((treatment) => treatment.status === TREATMENT_STATUS.ACTIVE).length
  const mobileBrowseHidden = isMobileEditorOpen || isPreviewOpen
  const mobileEditorVisible = isMobileEditorOpen && draft

  return (
    <>
      <Seo
        title="Treatment Management | Retreat by the Mournes"
        description="Administrator treatment management."
        path="/admin/treatments"
        robots="noindex, nofollow"
      />

      <div className={`admin-panel admin-mobile-editor-page ${mobileBrowseHidden ? "is-mobile-focused" : ""}`}>
        <div className={`admin-mobile-browser-view ${mobileBrowseHidden ? "is-hidden-on-mobile" : ""}`}>
          <div className="admin-panel__header admin-panel__header--stacked">
            <div>
              <h2 className="admin-panel__title">Treatment Management</h2>
              <p className="section-copy admin-panel__copy">
                Create, edit and manage how treatments appear on the website without touching code.
              </p>
            </div>

            <div className="admin-inline-links" aria-label="Treatment actions">
              <span className="admin-auth-note">
                {activeTreatmentCount} active treatment{activeTreatmentCount === 1 ? "" : "s"}
              </span>
              <button type="button" className="ghost-button" onClick={createNewTreatment}>
                New Treatment
              </button>
            </div>
          </div>

          {isLoading || !draft ? (
            <LoadingMessage message="Loading your treatments..." className="admin-panel__status" />
          ) : (
            <div className="admin-treatments-layout admin-treatments-layout--browsing">
              <aside className="admin-subpanel admin-treatments-list">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">All Treatments</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Featured treatments appear first, then standard treatments by display order.
                    </p>
                  </div>
                </div>

                <div className="admin-treatment-list">
                  {treatments.map((treatment) => (
                    <button
                      type="button"
                      key={treatment.id}
                      className={`admin-treatment-list__item ${selectedTreatmentId === treatment.id ? "is-active" : ""}`}
                      onClick={() => selectTreatment(treatment)}
                    >
                      <div className="admin-treatment-list__header">
                        <strong>{treatment.name}</strong>
                        <StatusBadge status={treatment.status} />
                      </div>
                      <p className="admin-treatment-list__meta">{treatment.category}</p>
                      <div className="admin-treatment-list__stats">
                        <span>{treatment.options?.[0]?.duration_minutes ?? 0} min</span>
                        <span>{formatCurrency(treatment.options?.[0]?.price ?? 0)}</span>
                        <span>{treatment.featured ? "Featured" : "Standard"}</span>
                        <span>{treatment.booking_enabled ? "Booking on" : "Booking off"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="admin-subpanel admin-subpanel--stretch admin-desktop-editor-panel">
                <div className="admin-subpanel__header">
                  <div>
                    <h3 className="admin-subpanel__title">{isSelectedTreatmentNew ? "Create Treatment" : draft.name || "Edit Treatment"}</h3>
                    <p className="section-copy admin-subpanel__copy">
                      Current status: <strong>{statusLabel}</strong>
                    </p>
                  </div>
                </div>

                <div className="admin-form-grid admin-form-grid--two-column">
                  <label className="admin-field">
                    <span className="admin-field__label">Name</span>
                    <input className="admin-input" name="name" value={draft.name} onChange={handleFieldChange} />
                    {errors.name ? <span className="admin-inline-error">{errors.name}</span> : null}
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Category</span>
                    <input className="admin-input" name="category" value={draft.category} onChange={handleFieldChange} />
                    {errors.category ? <span className="admin-inline-error">{errors.category}</span> : null}
                  </label>

                  <label className="admin-field admin-field--full">
                    <span className="admin-field__label">Description</span>
                    <textarea className="admin-input admin-textarea" name="description" value={draft.description} onChange={handleFieldChange} />
                    {errors.description ? <span className="admin-inline-error">{errors.description}</span> : null}
                  </label>

                  <label className="admin-field">
                    <span className="admin-field__label">Display Order</span>
                    <input className="admin-input" type="number" min="0" name="display_order" value={draft.display_order} onChange={handleFieldChange} />
                    {errors.display_order ? <span className="admin-inline-error">{errors.display_order}</span> : null}
                  </label>

                  <div className="admin-field admin-field--toggles">
                    <label className="admin-toggle">
                      <input type="checkbox" name="featured" checked={draft.featured} onChange={handleFieldChange} />
                      <span>Featured treatment</span>
                    </label>

                    <label className="admin-toggle">
                      <input type="checkbox" name="booking_enabled" checked={draft.booking_enabled} onChange={handleFieldChange} />
                      <span>Booking enabled</span>
                    </label>
                  </div>
                </div>

                <div className="admin-subpanel admin-subpanel--nested">
                  <div className="admin-subpanel__header">
                    <div>
                      <h3 className="admin-subpanel__title">Pricing Options</h3>
                      <p className="section-copy admin-subpanel__copy">
                        Multiple pricing options keep the public Treatments page visually unchanged.
                      </p>
                    </div>

                    <button type="button" className="ghost-button" onClick={addOption}>
                      Add Option
                    </button>
                  </div>

                  {errors.options ? <p className="admin-inline-error">{errors.options}</p> : null}

                  <div className="admin-option-list">
                    {draft.options.map((option, index) => {
                      const optionErrors = errors.optionErrors?.[index] ?? {}

                      return (
                        <div key={option.id} className="admin-option-card">
                          <div className="admin-option-card__header">
                            <strong>Option {index + 1}</strong>
                            <button type="button" className="admin-auth-link" onClick={() => removeOption(option.id)}>
                              Remove
                            </button>
                          </div>

                          <div className="admin-form-grid admin-form-grid--four-column">
                            <label className="admin-field">
                              <span className="admin-field__label">Label</span>
                              <input className="admin-input" value={option.label} onChange={(event) => handleOptionChange(option.id, "label", event.target.value)} />
                              {optionErrors.label ? <span className="admin-inline-error">{optionErrors.label}</span> : null}
                            </label>

                            <label className="admin-field">
                              <span className="admin-field__label">Duration (minutes)</span>
                              <input className="admin-input" type="number" min="1" value={option.duration_minutes} onChange={(event) => handleOptionChange(option.id, "duration_minutes", event.target.value)} />
                              {optionErrors.duration_minutes ? <span className="admin-inline-error">{optionErrors.duration_minutes}</span> : null}
                            </label>

                            <label className="admin-field">
                              <span className="admin-field__label">Price (£)</span>
                              <input className="admin-input" type="number" min="0" step="0.01" value={option.price} onChange={(event) => handleOptionChange(option.id, "price", event.target.value)} />
                              {optionErrors.price ? <span className="admin-inline-error">{optionErrors.price}</span> : null}
                            </label>

                            <label className="admin-field">
                              <span className="admin-field__label">Deposit (£)</span>
                              <input className="admin-input" type="number" min="0" step="0.01" value={option.deposit_amount} onChange={(event) => handleOptionChange(option.id, "deposit_amount", event.target.value)} />
                              {optionErrors.deposit_amount ? <span className="admin-inline-error">{optionErrors.deposit_amount}</span> : null}
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="admin-subpanel admin-subpanel--nested">
                  <div className="admin-subpanel__header">
                    <div>
                      <h3 className="admin-subpanel__title">Preview</h3>
                      <p className="section-copy admin-subpanel__copy">
                        A lightweight preview of how the treatment content reads before publishing.
                      </p>
                    </div>
                  </div>

                  <TreatmentPreview draft={draft} previewOptions={previewOptions} />
                </div>

                <div className="admin-form-actions">
                  {feedback ? <StatusMessage tone={feedback.includes("couldn't") ? "error" : "success"}>{feedback}</StatusMessage> : null}

                  <div className="admin-action-row">
                    <button type="button" className="ghost-button" disabled={isSaving} onClick={() => persistTreatment()}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" className="ghost-button" disabled={isSaving} onClick={() => persistTreatment(TREATMENT_STATUS.DRAFT)}>
                      Save as Draft
                    </button>
                    <button type="button" className="cta-button" disabled={isSaving} onClick={() => persistTreatment(TREATMENT_STATUS.ACTIVE)}>
                      Publish
                    </button>
                    {draft.id ? (
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={isSaving}
                        onClick={() => {
                          if (window.confirm("Set this treatment to inactive? It will be hidden from the public website but kept safely in the system.")) {
                            persistTreatment(TREATMENT_STATUS.INACTIVE)
                          }
                        }}
                      >
                        {activeTreatment?.status === TREATMENT_STATUS.INACTIVE ? "Reactivate" : "Deactivate"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {mobileEditorVisible ? (
          <div className="admin-mobile-editor-view">
            <AdminEditingHeader
              parentLabel="Treatments"
              title={isSelectedTreatmentNew ? "Create Treatment" : "Edit Treatment"}
              onBack={closeEditor}
              onSave={() => persistTreatment()}
              saveLabel="Save"
              isSaving={isSaving}
              menuOpen={isActionMenuOpen}
              onToggleMenu={() => setIsActionMenuOpen((current) => !current)}
              menuLabel="Treatment actions"
            >
              <button type="button" className="admin-editing-menu__item" onClick={() => persistTreatment(TREATMENT_STATUS.DRAFT)}>
                Save as Draft
              </button>
              <button type="button" className="admin-editing-menu__item" onClick={() => persistTreatment(TREATMENT_STATUS.ACTIVE)}>
                Publish
              </button>
              {draft.id ? (
                <button
                  type="button"
                  className="admin-editing-menu__item"
                  onClick={() => {
                    if (window.confirm("Set this treatment to inactive? It will be hidden from the public website but kept safely in the system.")) {
                      persistTreatment(TREATMENT_STATUS.INACTIVE)
                    }
                  }}
                >
                  {activeTreatment?.status === TREATMENT_STATUS.INACTIVE ? "Reactivate" : "Deactivate"}
                </button>
              ) : null}
            </AdminEditingHeader>

            {feedback ? <StatusMessage tone={feedback.includes("couldn't") ? "error" : "success"}>{feedback}</StatusMessage> : null}

            <section className="admin-subpanel admin-subpanel--editing">
              <div className="admin-editing-status">
                <p className="admin-auth-note">
                  Current status: <strong>{statusLabel}</strong>
                </p>
                <button type="button" className="ghost-button admin-editing-preview-button" onClick={() => setIsPreviewOpen(true)}>
                  Preview Treatment
                </button>
              </div>

              <div className="admin-form-grid">
                <label className="admin-field">
                  <span className="admin-field__label">Name</span>
                  <input ref={firstFieldRef} className="admin-input" name="name" value={draft.name} onChange={handleFieldChange} />
                  {errors.name ? <span className="admin-inline-error">{errors.name}</span> : null}
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Category</span>
                  <input className="admin-input" name="category" value={draft.category} onChange={handleFieldChange} />
                  {errors.category ? <span className="admin-inline-error">{errors.category}</span> : null}
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Description</span>
                  <textarea className="admin-input admin-textarea" name="description" value={draft.description} onChange={handleFieldChange} />
                  {errors.description ? <span className="admin-inline-error">{errors.description}</span> : null}
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Display Order</span>
                  <input className="admin-input" type="number" min="0" name="display_order" value={draft.display_order} onChange={handleFieldChange} />
                  {errors.display_order ? <span className="admin-inline-error">{errors.display_order}</span> : null}
                </label>

                <div className="admin-field admin-field--toggles">
                  <label className="admin-toggle">
                    <input type="checkbox" name="featured" checked={draft.featured} onChange={handleFieldChange} />
                    <span>Featured treatment</span>
                  </label>

                  <label className="admin-toggle">
                    <input type="checkbox" name="booking_enabled" checked={draft.booking_enabled} onChange={handleFieldChange} />
                    <span>Booking enabled</span>
                  </label>
                </div>
              </div>
            </section>

            <section className="admin-subpanel admin-subpanel--editing">
              <div className="admin-subpanel__header">
                <div>
                  <h3 className="admin-subpanel__title">Pricing Options</h3>
                  <p className="section-copy admin-subpanel__copy">
                    Multiple pricing options keep the public Treatments page visually unchanged.
                  </p>
                </div>

                <button type="button" className="ghost-button" onClick={addOption}>
                  Add Option
                </button>
              </div>

              {errors.options ? <p className="admin-inline-error">{errors.options}</p> : null}

              <div className="admin-option-list">
                {draft.options.map((option, index) => {
                  const optionErrors = errors.optionErrors?.[index] ?? {}

                  return (
                    <div key={option.id} className="admin-option-card">
                      <div className="admin-option-card__header">
                        <strong>Option {index + 1}</strong>
                        <button type="button" className="admin-auth-link" onClick={() => removeOption(option.id)}>
                          Remove
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="admin-field">
                          <span className="admin-field__label">Label</span>
                          <input className="admin-input" value={option.label} onChange={(event) => handleOptionChange(option.id, "label", event.target.value)} />
                          {optionErrors.label ? <span className="admin-inline-error">{optionErrors.label}</span> : null}
                        </label>

                        <label className="admin-field">
                          <span className="admin-field__label">Duration (minutes)</span>
                          <input
                            className="admin-input"
                            type="number"
                            min="1"
                            value={option.duration_minutes}
                            onChange={(event) => handleOptionChange(option.id, "duration_minutes", event.target.value)}
                          />
                          {optionErrors.duration_minutes ? <span className="admin-inline-error">{optionErrors.duration_minutes}</span> : null}
                        </label>

                        <label className="admin-field">
                          <span className="admin-field__label">Price (£)</span>
                          <input
                            className="admin-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={option.price}
                            onChange={(event) => handleOptionChange(option.id, "price", event.target.value)}
                          />
                          {optionErrors.price ? <span className="admin-inline-error">{optionErrors.price}</span> : null}
                        </label>

                        <label className="admin-field">
                          <span className="admin-field__label">Deposit (£)</span>
                          <input
                            className="admin-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={option.deposit_amount}
                            onChange={(event) => handleOptionChange(option.id, "deposit_amount", event.target.value)}
                          />
                          {optionErrors.deposit_amount ? <span className="admin-inline-error">{optionErrors.deposit_amount}</span> : null}
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        ) : null}

        {isPreviewOpen && draft ? (
          <div className="admin-preview-sheet" role="dialog" aria-modal="true" aria-labelledby="treatment-preview-title">
            <div className="admin-preview-sheet__backdrop" onClick={() => setIsPreviewOpen(false)} />
            <div className="admin-preview-sheet__panel">
              <div className="admin-preview-sheet__header">
                <h3 id="treatment-preview-title" className="admin-subpanel__title">
                  Treatment Preview
                </h3>
                <button type="button" className="ghost-button" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </button>
              </div>

              <TreatmentPreview draft={draft} previewOptions={previewOptions} />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className={`admin-fab ${mobileBrowseHidden ? "is-hidden" : ""}`}
          onClick={createNewTreatment}
          aria-label="Create new treatment"
        >
          +
        </button>
      </div>
    </>
  )
}

export default AdminTreatments
