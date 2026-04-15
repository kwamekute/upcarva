import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useProfile(session) {
  const [profileReady, setProfileReady] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(false)

  const checkProfile = async (userId) => {
    setCheckingProfile(true)
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", userId)
        .maybeSingle()

      setProfileReady(!!data)
    } catch (err) {
      console.error("checkProfile failed:", err)
      setProfileReady(false)
    } finally {
      setCheckingProfile(false)
    }
  }

  useEffect(() => {
    if (!session) return
    checkProfile(session.user.id)
  }, [session])

  return { profileReady, setProfileReady, checkingProfile }
}