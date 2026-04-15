import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useMealLogs() {
  const [logs, setLogs] = useState([])
  const [streak, setStreak] = useState(0)
  const [challengeDays, setChallengeDays] = useState(0)

  const calculateStreak = (datesArray) => {
    if (!datesArray.length) { setStreak(0); return }

    const today = new Date().toISOString().split("T")[0]
    const sorted = [...datesArray].sort().reverse()

    let count = 0
    let current = new Date(today)

    if (!sorted.includes(today)) {
      current.setDate(current.getDate() - 1)
    }

    while (true) {
      const check = current.toISOString().split("T")[0]
      if (sorted.includes(check)) {
        count++
        current.setDate(current.getDate() - 1)
      } else {
        break
      }
    }

    setStreak(count)
  }

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data, error } = await supabase
        .from("meals")
        .select("log_date")
        .eq("auth_id", user.id)

      if (error) { console.error(error); return }

      if (!data || data.length === 0) {
        setLogs([])
        setStreak(0)
        setChallengeDays(0)
        return
      }

      const uniqueDays = [...new Set(data.map(d => d.log_date))].sort()
      setLogs(uniqueDays)
      setChallengeDays(uniqueDays.length)
      calculateStreak(uniqueDays)
    }

    fetchLogs()
  }, [])

  return { logs, streak, challengeDays }
}