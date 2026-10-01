import { useEffect, useState } from "react"
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import Seo from "../components/Seo"
import StatusMessage from "../components/StatusMessage"
import { useAuth } from "../components/useAuth"
import { getAuthErrorMessage } from "../lib/supabase/helpers"

function AdminLogin() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, loading, signInWithPassword } = useAuth()
  const [formValues, setFormValues] = useState({ email: "", password: "" })
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? "/admin"
  const successMessage =
    searchParams.get("message") === "password-reset-success"
      ? "Your password has been updated successfully. Please sign in."
      : ""

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, redirectTo])

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const { error } = await signInWithPassword({
      email: formValues.email.trim(),
      password: formValues.password,
    })

    if (error) {
      setErrorMessage(getAuthErrorMessage(error))
      setIsSubmitting(false)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <>
      <Seo
        title="Admin Login | Retreat by the Mournes"
        description="Secure administrator login."
        path="/admin/login"
        robots="noindex, nofollow"
      />

      <section className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-kicker">Administrator Access</p>
          <h1 className="admin-auth-title">Sign in to manage concierge bookings</h1>
          <p className="section-copy admin-auth-copy">
            This secure area is for Retreat by the Mournes administration only.
          </p>

          <form className="admin-auth-form" onSubmit={handleSubmit}>
            {successMessage ? <StatusMessage tone="success">{successMessage}</StatusMessage> : null}
            <label className="admin-field">
              <span className="admin-field__label">Email</span>
              <input
                className="admin-input"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formValues.email}
                onChange={handleChange}
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Password</span>
              <input
                className="admin-input"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={formValues.password}
                onChange={handleChange}
              />
            </label>

            {errorMessage ? <StatusMessage tone="error">{errorMessage}</StatusMessage> : null}

            <button type="submit" className="cta-button admin-auth-submit" disabled={isSubmitting || loading}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <div className="admin-auth-actions">
              <Link className="admin-auth-link" to="/admin/forgot-password">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default AdminLogin
