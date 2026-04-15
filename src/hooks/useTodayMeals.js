import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useTodayMeals() {
  const [meals, setMeals] = useState([])
  const [hasLoggedToday, setHasLoggedToday] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  const fetchMeals = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) return

    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("log_date", today)
      .eq("auth_id", user.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setMeals(data || [])
    setHasLoggedToday(!!data?.length)
  }

  useEffect(() => {
    fetchMeals()

    const handleFocus = () => fetchMeals()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  return { meals, hasLoggedToday }
}