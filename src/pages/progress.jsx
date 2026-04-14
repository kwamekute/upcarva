import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Progress() {
  const [logs, setLogs] = useState([])
  const [streak, setStreak] = useState(0)
  const [challengeDays, setChallengeDays] = useState(0)
   const [user, setUser] = useState(null)

  // 🔥 GET USER FIRST
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUser(data.user)
    }

    getUser()
  }, [])
  // 🔥 FETCH USER DATA ONLY
  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("log_date")
       .eq("auth_id", user.id)

    if (error) {
      console.error(error)
      return
    }

    if (!data || data.length === 0) {
      setLogs([])
      setStreak(0)
      setChallengeDays(0)
      return
    }

    // 🔥 unique days
    const uniqueDays = [...new Set(data.map(d => d.log_date))].sort()

    setLogs(uniqueDays)
    setChallengeDays(uniqueDays.length)

    calculateStreak(uniqueDays)
  }

  // 🔥 STREAK LOGIC (UNCHANGED BUT CLEAN)
  const calculateStreak = (datesArray) => {
    if (!datesArray.length) {
      setStreak(0)
      return
    }

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

  // 🔥 WEEK VIEW (FIXED + CLEAN)
  const getWeekData = () => {
    const today = new Date()
    const week = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)

      const dateStr = d.toISOString().split("T")[0]

      week.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateStr,
        logged: logs.includes(dateStr)
      })
    }

    return week
  }

  useEffect(() => {
    fetchLogs()
  })

  const week = getWeekData()
  const total = week.filter(d => d.logged).length

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-6">
      <div className="max-w-sm mx-auto">

        {/* 🔥 14 DAY PROGRESS */}
        <div className="bg-white rounded-xl p-4 text-center mb-4 shadow-sm">
          <p className="text-lg font-semibold">
            {challengeDays} / 14 days
          </p>

          <div className="h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.min((challengeDays / 14) * 100, 100)}%`,
                background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
              }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Challenge progress 🚀
          </p>
        </div>

        {/* 🔥 STREAK */}
        <div className="bg-gray-100 rounded-xl p-4 text-center mb-4">
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-sm text-gray-600">
            day streak 🔥 — keep it alive
          </p>
        </div>

        {/* 🔥 WEEK SUMMARY */}
        <p className="text-sm text-gray-600 mb-2">
          {total} / 7 days logged — {Math.round((total / 7) * 100)}% this week
        </p>

        {/* 🔥 WEEK */}
        <div className="bg-white rounded-xl p-3 space-y-2">
          {week.map((d, i) => (
            <div key={i} className="flex items-center justify-between">

              <span className="text-sm">{d.day}</span>

              <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: d.logged ? "100%" : "0%"
                  }}
                />
              </div>

              <span className="text-sm">
                {d.logged ? "✔" : "—"}
              </span>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}