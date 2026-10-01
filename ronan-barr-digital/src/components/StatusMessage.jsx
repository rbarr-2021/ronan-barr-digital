function StatusMessage({ tone = "info", children, className = "", polite = true }) {
  if (!children) {
    return null
  }

  const classes = ["status-message", `status-message--${tone}`, className].filter(Boolean).join(" ")

  return (
    <div className={classes} role={tone === "error" ? "alert" : "status"} aria-live={polite ? "polite" : "assertive"}>
      {children}
    </div>
  )
}

export default StatusMessage
