import { createClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "./helpers"

const { url, key } = getSupabaseConfig()

const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
