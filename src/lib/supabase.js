import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("SUPABASE URL:", supabaseUrl)
console.log("SUPABASE KEY:", supabaseKey)

console.log("ENV:", import.meta.env.VITE_SUPABASE_URL)


if (!window._supabase) {
  window._supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  })
}

export const supabase = window._supabase

