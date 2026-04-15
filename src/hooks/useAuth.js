import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return { session }
}