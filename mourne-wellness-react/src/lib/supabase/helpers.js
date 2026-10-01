const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.")
  }

  return {
    url: supabaseUrl,
    key: supabaseKey,
  }
}

export function getSiteUrl() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim()

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "")
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }

  return ""
}

export function getPasswordResetRedirectUrl() {
  const siteUrl = getSiteUrl()

  return siteUrl ? `${siteUrl}/admin/auth/callback` : ""
}

export function getAuthErrorMessage(error) {
  if (!error) return "Something went wrong. Please try again."

  const message = error.message?.toLowerCase() ?? ""

  if (message.includes("invalid login credentials")) {
    return "The email or password you entered was not recognised."
  }

  if (message.includes("email not confirmed")) {
    return "This administrator account is not yet confirmed."
  }

  if (
    message.includes("expired") ||
    message.includes("invalid grant") ||
    message.includes("invalid token") ||
    message.includes("refresh token") ||
    message.includes("code verifier") ||
    message.includes("otp")
  ) {
    return "This password reset link is invalid, expired or has already been used. Please request a new one."
  }

  if (message.includes("fetch") || message.includes("network") || message.includes("failed to fetch")) {
    return "We couldn't reach the server just now. Please check your connection and try again."
  }

  return "We couldn't complete that request just now. Please try again or request a fresh reset link."
}
