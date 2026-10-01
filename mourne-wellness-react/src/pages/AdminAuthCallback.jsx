import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import LoadingMessage from "../components/LoadingMessage"
import Seo from "../components/Seo"
import StatusMessage from "../components/StatusMessage"
import { exchangeCodeForSession, getSession, onAuthStateChange } from "../lib/supabase/auth"
import { getAuthErrorMessage } from "../lib/supabase/helpers"

function AdminAuthCallback() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")
  const handledRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const recoveryType = searchParams.get("type") ?? hashParams.get("type")
    const hasRecoveryToken =
      Boolean(searchParams.get("code")) ||
      Boolean(hashParams.get("access_token")) ||
      Boolean(hashParams.get("refresh_token")) ||
      recoveryType === "recovery"
    const authError =
      searchParams.get("error_description") ||
      hashParams.get("error_description") ||
      searchParams.get("error") ||
      hashParams.get("error")

    const finishWithError = (message) => {
      if (!isMounted || handledRef.current) return

      handledRef.current = true
      setErrorMessage(message)
    }

    const finishWithSuccess = () => {
      if (!isMounted || handledRef.current) return

      handledRef.current = true
      navigate("/admin/reset-password", { replace: true })
    }

    if (authError) {
      finishWithError(getAuthErrorMessage({ message: authError }))
      return undefined
    }

    const { data } = onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        finishWithSuccess()
      }
    })

    const handleCallback = async () => {
      const code = searchParams.get("code")

      if (!hasRecoveryToken) {
        finishWithError("This password reset link is invalid, expired or has already been used. Please request a new one.")
        return
      }

      if (code) {
        const { error } = await exchangeCodeForSession(code)

        if (error) {
          finishWithError(getAuthErrorMessage(error))
          return
        }

        finishWithSuccess()
        return
      }

      const { data: sessionData } = await getSession()

      if (sessionData.session) {
        finishWithSuccess()
        return
      }

      window.setTimeout(async () => {
        if (!isMounted || handledRef.current) return

        const { data: latestSessionData } = await getSession()

        if (latestSessionData.session) {
          finishWithSuccess()
          return
        }

        finishWithError("This password reset link is invalid, expired or has already been used. Please request a new one.")
      }, 1200)
    }

    handleCallback()

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <>
      <Seo
        title="Auth Callback | Retreat by the Mournes"
        description="Secure administrator authentication callback."
        path="/admin/auth/callback"
        robots="noindex, nofollow"
      />

      <section className="admin-auth-shell">
        <div className="admin-auth-card">
          {!errorMessage ? (
            <>
              <p className="admin-kicker">Administrator Access</p>
              <h1 className="admin-auth-title">Verifying your secure reset link</h1>
              <LoadingMessage message="Please wait while we confirm your request and prepare your password reset." />
            </>
          ) : (
            <>
              <p className="admin-kicker">Administrator Access</p>
              <h1 className="admin-auth-title">This reset link can&apos;t be used</h1>
              <StatusMessage tone="error">{errorMessage}</StatusMessage>
              <div className="admin-auth-actions" style={{ marginTop: "24px" }}>
                <Link className="cta-button admin-auth-secondary" to="/admin/forgot-password">
                  Request a new reset link
                </Link>
                <Link className="admin-auth-link" to="/admin/login">
                  Back to admin login
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default AdminAuthCallback
