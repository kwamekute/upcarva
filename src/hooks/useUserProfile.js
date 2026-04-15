import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useUserProfile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle()

      setProfile(profile)
    }

    fetchProfile()
  }, [])

  return { profile }
}