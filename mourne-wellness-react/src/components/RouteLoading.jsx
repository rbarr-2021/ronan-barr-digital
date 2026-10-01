import LoadingMessage from "./LoadingMessage"

function RouteLoading({ message = "Loading..." }) {
  return (
    <section className="admin-auth-shell">
      <div className="admin-auth-card">
        <LoadingMessage message={message} />
      </div>
    </section>
  )
}

export default RouteLoading
