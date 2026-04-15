import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useMealHistory() {
  const [grouped, setGrouped] = useState({})

  useEffect(() => {
    const fetchMeals = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("auth_id", user.id)
        .order("created_at", { ascending: false })

      if (error) { console.error(error); return }
      if (!data) return

      const groupedData = {}
      data.forEach((meal) => {
        const date = meal.log_date
        if (!groupedData[date]) groupedData[date] = []
        groupedData[date].push({ description: meal.description, reason: meal.reason })
      })

      setGrouped(groupedData)
    }

    fetchMeals()
  }, [])

  return { grouped }
}