function AdminEditingHeader({
  parentLabel,
  title,
  onBack,
  onSave,
  saveLabel = "Save",
  isSaving = false,
  menuOpen = false,
  onToggleMenu,
  menuLabel = "More actions",
  children,
}) {
  return (
    <header className="admin-editing-header">
      <div className="admin-editing-header__bar">
        <button type="button" className="admin-editing-header__back" onClick={onBack}>
          <span aria-hidden="true">&larr;</span>
          <span>{parentLabel}</span>
        </button>

        <div className="admin-editing-header__actions">
          <button type="button" className="cta-button admin-editing-header__save" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : saveLabel}
          </button>

          <div className={`admin-editing-menu ${menuOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="ghost-button admin-editing-menu__toggle"
              aria-expanded={menuOpen}
              aria-label={menuLabel}
              onClick={onToggleMenu}
            >
              More
            </button>

            {menuOpen ? <div className="admin-editing-menu__panel">{children}</div> : null}
          </div>
        </div>
      </div>

      <div className="admin-editing-header__title-row">
        <h2 className="admin-editing-header__title">{title}</h2>
      </div>
    </header>
  )
}

export default AdminEditingHeader
