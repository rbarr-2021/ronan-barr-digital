import { createClient } from "@supabase/supabase-js"

let adminClient = null

function getServerSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
}

function getServerSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
}

export function getAdminSupabaseClient() {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = getServerSupabaseUrl()
  const serviceRoleKey = getServerSupabaseServiceRoleKey()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server credentials are missing.")
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
