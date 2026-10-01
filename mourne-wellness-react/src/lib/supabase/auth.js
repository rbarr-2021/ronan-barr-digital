import supabase from "./client"
import { getPasswordResetRedirectUrl } from "./helpers"

export async function signInWithPassword(credentials) {
  return supabase.auth.signInWithPassword(credentials)
}

export async function resetPasswordForEmail(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl(),
  })
}

export async function exchangeCodeForSession(code) {
  return supabase.auth.exchangeCodeForSession(code)
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({ password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
