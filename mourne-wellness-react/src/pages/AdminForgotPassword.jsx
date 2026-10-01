import { useState } from "react"
import { Link } from "react-router-dom"
import Seo from "../components/Seo"
import StatusMessage from "../components/StatusMessage"
import { useAuth } from "../components/useAuth"
import { getAuthErrorMessage } from "../lib/supabase/helpers"

function AdminForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setIsSubmitting(true)

    const { error } = await resetPasswordForEmail(email.trim())

    if (error) {
      setErrorMessage(getAuthErrorMessage(error))
      setIsSubmitting(false)
      return
    }

    setSuccessMessage("If an account exists for this email address, a password reset link has been sent.")
    setIsSubmitting(false)
  }

  return (
    <>
      <Seo
        title="Forgot Password | Retreat by the Mournes"
        description="Secure administrator password reset request."
        path="/admin/forgot-password"
        robots="noindex, nofollow"
      />

      <section className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-kicker">Administrator Access</p>
          <h1 className="admin-auth-title">Reset your password</h1>
          <p className="section-copy admin-auth-copy">
            Enter your administrator email and we&apos;ll send a secure password reset link.
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {errorMessage ? <StatusMessage tone="error">{errorMessage}</StatusMessage> : null}

            <button type="submit" className="cta-button admin-auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </button>

            <div className="admin-auth-actions">
              <Link className="admin-auth-link" to="/admin/login">
                Back to admin login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default AdminForgotPassword
