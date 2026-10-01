function AdminEmptyState({ title, children, action = null, className = "" }) {
  return (
    <div className={["admin-empty-state", className].filter(Boolean).join(" ")}>
      <strong>{title}</strong>
      {children ? <p className="section-copy">{children}</p> : null}
      {action}
    </div>
  )
}

export default AdminEmptyState
