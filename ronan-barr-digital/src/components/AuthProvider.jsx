import { useEffect, useState } from "react"
import { getSession, onAuthStateChange, resetPasswordForEmail, signInWithPassword, signOut, updatePassword } from "../lib/supabase/auth"
import { AuthContext } from "./AuthContext"

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getSession().then(({ data, error }) => {
      if (!isMounted) return

      if (error) {
        setSession(null)
      } else {
        setSession(data.session ?? null)
      }

      setLoading(false)
    })

    const { data } = onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return

      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.user),
    loading,
    signInWithPassword,
    resetPasswordForEmail,
    updatePassword,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
