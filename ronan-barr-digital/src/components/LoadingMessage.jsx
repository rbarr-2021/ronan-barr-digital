function LoadingMessage({ message, className = "" }) {
  return (
    <div className={["status-message", "status-message--loading", className].filter(Boolean).join(" ")} role="status" aria-live="polite">
      <span className="status-message__spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export default LoadingMessage
