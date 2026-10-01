import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import LoadingMessage from "../components/LoadingMessage"
import Seo from "../components/Seo"
import StatusMessage from "../components/StatusMessage"
import { useAuth } from "../components/useAuth"
import { getAuthErrorMessage } from "../lib/supabase/helpers"

const MIN_PASSWORD_LENGTH = 12

function getPasswordValidationMessage(password, confirmPassword) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  }

  if (confirmPassword.length === 0) {
    return "Please confirm your new password."
  }

  if (password !== confirmPassword) {
    return "Your password confirmation does not match."
  }

  return ""
}

function AdminResetPassword() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, signOut, updatePassword } = useAuth()
  const [formValues, setFormValues] = useState({ password: "", confirmPassword: "" })
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validationMessage = useMemo(
    () => getPasswordValidationMessage(formValues.password, formValues.confirmPassword),
    [formValues.confirmPassword, formValues.password]
  )

  if (!loading && !isAuthenticated) {
    return (
      <>
        <Seo
          title="Reset Password | Retreat by the Mournes"
          description="Secure administrator password reset."
          path="/admin/reset-password"
          robots="noindex, nofollow"
        />

        <section className="admin-auth-shell">
          <div className="admin-auth-card">
            <p className="admin-kicker">Administrator Access</p>
            <h1 className="admin-auth-title">Your reset session is no longer available</h1>
            <StatusMessage tone="error">
              This password reset link is invalid, expired or has already been used. Please request a fresh link to continue.
            </StatusMessage>
            <div className="admin-auth-actions" style={{ marginTop: "24px" }}>
              <Link className="cta-button admin-auth-secondary" to="/admin/forgot-password">
                Request a new reset link
              </Link>
              <Link className="admin-auth-link" to="/admin/login">
                Back to admin login
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Seo
          title="Reset Password | Retreat by the Mournes"
          description="Secure administrator password reset."
          path="/admin/reset-password"
          robots="noindex, nofollow"
        />

        <section className="admin-auth-shell">
          <div className="admin-auth-card">
            <p className="admin-kicker">Administrator Access</p>
            <h1 className="admin-auth-title">Preparing your password reset</h1>
            <LoadingMessage message="Please wait while we verify your secure reset session." />
          </div>
        </section>
      </>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setErrorMessage("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSubmitting(true)

    const { error } = await updatePassword(formValues.password)

    if (error) {
      setErrorMessage(getAuthErrorMessage(error))
      setIsSubmitting(false)
      return
    }

    await signOut()
    navigate("/admin/login?message=password-reset-success", { replace: true })
  }

  return (
    <>
      <Seo
        title="Reset Password | Retreat by the Mournes"
        description="Secure administrator password reset."
        path="/admin/reset-password"
        robots="noindex, nofollow"
      />

      <section className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-kicker">Administrator Access</p>
          <h1 className="admin-auth-title">Choose a new password</h1>
          <p className="section-copy admin-auth-copy">
            Create a new administrator password using at least 12 characters.
          </p>

          <form className="admin-auth-form" onSubmit={handleSubmit}>
            <label className="admin-field">
              <span className="admin-field__label">New password</span>
              <input
                className="admin-input"
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={formValues.password}
                onChange={handleChange}
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Confirm new password</span>
              <input
                className="admin-input"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={formValues.confirmPassword}
                onChange={handleChange}
              />
            </label>

            <p className="admin-auth-note">Minimum 12 characters. Use a strong, unique password for administrator access.</p>

            {errorMessage ? <StatusMessage tone="error">{errorMessage}</StatusMessage> : null}

            <button type="submit" className="cta-button admin-auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating password..." : "Update password"}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

export default AdminResetPassword
