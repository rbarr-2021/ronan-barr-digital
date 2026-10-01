import { getAdminSupabaseClient } from "../../src/lib/supabase/admin.js"

export async function requireAuthenticatedAdmin(request) {
  const authorization = request.headers.authorization || ""
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null

  if (!token) {
    throw new Error("You need to sign in again before requesting a payment link.")
  }

  const supabase = getAdminSupabaseClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    throw new Error("Your administrator session could not be verified.")
  }

  return data.user
}
