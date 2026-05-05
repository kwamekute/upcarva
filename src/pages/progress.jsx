import { useMealLogs } from "../hooks/useMealLogs"
import StreakCard from "../components/StreakCard"
import { useData } from "../contexts/DataContext"
import { usePhase2Moves } from "../hooks/usePhase2Moves"

const monthName = new Date().toLocaleDateString("en-US", { month: "long" })

function Phase2Progress() {
  const { profile } = useData()
  const { streak, logs } = useMealLogs()
  const { phase2Day, monthSummary } = usePhase2Moves({ userId: profile?.auth_id, enabled: true })
  const completionRate = monthSummary.total ? Math.round((monthSummary.completed / monthSummary.total) * 100) : 0
  const activeDays = monthSummary.completed + monthSummary.partly
  const totalLoggedDays = logs.length
  const firstDay = monthSummary.days[0]?.date ? new Date(`${monthSummary.days[0].date}T00:00:00`).getDay() : 0

  const statusClass = (status) => {
    if (status === "did_it") return "bg-[#0db89a] shadow-[0_6px_16px_rgba(13,184,154,0.22)]"
    if (status === "partly") return "bg-[#f59e0b] shadow-[0_6px_16px_rgba(245,158,11,0.20)]"
    if (status === "not_today") return "bg-slate-300"
    if (status === "pending") return "bg-white border border-slate-200"
    return "bg-slate-100"
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] px-4 py-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#7c6cff]/12 blur-3xl" />
        <div className="absolute bottom-10 right-[-40px] h-[180px] w-[180px] rounded-full bg-[#ff8a3d]/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-sm space-y-4">
        <section className="rounded-[24px] border border-white/80 bg-white/75 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <span
            className="text-lg font-black tracking-tight"
            style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            upcarva
          </span>
          <h1 className="mt-2 text-[23px] font-semibold leading-none tracking-[-0.2px] text-slate-800">
            Monthly momentum
          </h1>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {monthName} • Calibration Phase
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-100 bg-white/70 px-2.5 py-2">
              <p className="text-[9px] text-slate-400">Moves</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">{monthSummary.completed}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white/70 px-2.5 py-2">
              <p className="text-[9px] text-slate-400">Phase day</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">{phase2Day}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white/70 px-2.5 py-2">
              <p className="text-[9px] text-slate-400">Logged</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">{totalLoggedDays}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            {activeDays} active calibration days this month. Current streak: {streak} 🔥
          </p>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/75 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Month view</p>
              <p className="mt-1 text-[13px] font-semibold text-slate-800">{completionRate}% moves completed</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-white px-2.5 py-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.07)]">
              <span className="h-2 w-2 rounded-[2px] bg-[#0db89a]" />
              <span className="text-[9px] text-[#8a8a9a]">done</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[9px] font-semibold text-slate-400">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {monthSummary.days.map((day) => (
              <div
                key={day.date}
                className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-semibold text-slate-600 ${statusClass(day.attempt?.completion_status)}`}
              >
                {new Date(`${day.date}T00:00:00`).getDate()}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-slate-400">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-[2px] bg-[#0db89a]" /> Done</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-[2px] bg-[#f59e0b]" /> Partly</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-[2px] bg-slate-300" /> Not today</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <p className="text-[12px] font-semibold text-slate-800">What this means</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Every green square is proof you followed through. Amber still counts as awareness. The aim is momentum, not perfection.
          </p>
        </section>
      </div>
    </div>
  )
}

export default function Progress() {
  const { profile } = useData()
  const { logs, streak, challengeDays, isStreakAtRisk } = useMealLogs()
  const phase2Preview =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).has("phase2") ||
      localStorage.getItem("upcarva_phase2_preview") === "true")
  const phase1Preview =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).has("phase1") ||
      localStorage.getItem("upcarva_phase_override") === "phase1")
  const isPhase2 = !phase1Preview && (!!profile?.phase2_unlocked || phase2Preview)

  if (isPhase2) {
    return <Phase2Progress />
  }

  const today = new Date().toISOString().split("T")[0]

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

  const week = getWeekData()
  const total = week.filter(d => d.logged).length

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-6">
      <div className="max-w-sm mx-auto">

        <div className="bg-white rounded-xl p-4 text-center mb-4 shadow-sm">
          <p className="text-lg font-semibold">{challengeDays} / 14 days</p>
          <div className="h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.min((challengeDays / 14) * 100, 100)}%`,
                background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Challenge progress 🚀</p>
        </div>

        <StreakCard
          streak={streak}
          hasLoggedToday={logs.includes(today)}
          isStreakAtRisk={isStreakAtRisk}
          logs={logs}
          className="mb-4"
        />

        <p className="text-sm text-gray-600 mb-2">
          {total} / 7 days logged — {Math.round((total / 7) * 100)}% this week
        </p>

        <div className="bg-white rounded-xl p-3 space-y-2">
          {week.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm">{d.day}</span>
              <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-500" style={{ width: d.logged ? "100%" : "0%" }} />
              </div>
              <span className="text-sm">{d.logged ? "✔" : "—"}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
// import { useEffect, useState } from "react"
// import { supabase } from "../lib/supabase"

// export default function Progress() {
//   const [logs, setLogs] = useState([])
//   const [streak, setStreak] = useState(0)
//   const [challengeDays, setChallengeDays] = useState(0)
 
  
//    const fetchLogs = async () => {
//     const { data: authData } = await supabase.auth.getUser()
//     const user = authData?.user
//     if (!user) return

//     const { data, error } = await supabase
//       .from("meals")
//       .select("log_date")
//       .eq("auth_id", user.id)

//     if (error) {
//       console.error(error)
//       return
//     }

//     if (!data || data.length === 0) {
//       setLogs([])
//       setStreak(0)
//       setChallengeDays(0)
//       return
//     }

//     const uniqueDays = [...new Set(data.map(d => d.log_date))].sort()
//     setLogs(uniqueDays)
//     setChallengeDays(uniqueDays.length)
//     calculateStreak(uniqueDays)
//   }

//   const calculateStreak = (datesArray) => {
//     if (!datesArray.length) { setStreak(0); return }

//     const today = new Date().toISOString().split("T")[0]
//     const sorted = [...datesArray].sort().reverse()

//     let count = 0
//     let current = new Date(today)

//     if (!sorted.includes(today)) {
//       current.setDate(current.getDate() - 1)
//     }

//     while (true) {
//       const check = current.toISOString().split("T")[0]
//       if (sorted.includes(check)) {
//         count++
//         current.setDate(current.getDate() - 1)
//       } else {
//         break
//       }
//     }

//     setStreak(count)
//   }

//   const getWeekData = () => {
//     const today = new Date()
//     const week = []

//     for (let i = 6; i >= 0; i--) {
//       const d = new Date(today)
//       d.setDate(today.getDate() - i)
//       const dateStr = d.toISOString().split("T")[0]
//       week.push({
//         day: d.toLocaleDateString("en-US", { weekday: "short" }),
//         date: dateStr,
//         logged: logs.includes(dateStr)
//       })
//     }

//     return week
//   }

//   useEffect(() => {
//     fetchLogs()
//   }, []) // ← fixed, was causing infinite loop

//    const week = getWeekData()
//   const total = week.filter(d => d.logged).length

//   return (
//     <div className="min-h-screen bg-[#f5f6fa] px-4 py-6">
//       <div className="max-w-sm mx-auto">

//         {/* 🔥 14 DAY PROGRESS */}
//         <div className="bg-white rounded-xl p-4 text-center mb-4 shadow-sm">
//           <p className="text-lg font-semibold">
//             {challengeDays} / 14 days
//           </p>

//           <div className="h-2 bg-gray-200 rounded-full mt-2">
//             <div
//               className="h-2 rounded-full"
//               style={{
//                 width: `${Math.min((challengeDays / 14) * 100, 100)}%`,
//                 background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
//               }}
//             />
//           </div>

//           <p className="text-xs text-gray-500 mt-1">
//             Challenge progress 🚀
//           </p>
//         </div>

//         {/* 🔥 STREAK */}
//         <div className="bg-gray-100 rounded-xl p-4 text-center mb-4">
//           <p className="text-2xl font-bold">{streak}</p>
//           <p className="text-sm text-gray-600">
//             day streak 🔥 — keep it alive
//           </p>
//         </div>

//         {/* 🔥 WEEK SUMMARY */}
//         <p className="text-sm text-gray-600 mb-2">
//           {total} / 7 days logged — {Math.round((total / 7) * 100)}% this week
//         </p>

//         {/* 🔥 WEEK */}
//         <div className="bg-white rounded-xl p-3 space-y-2">
//           {week.map((d, i) => (
//             <div key={i} className="flex items-center justify-between">

//               <span className="text-sm">{d.day}</span>

//               <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200">
//                 <div
//                   className="h-2 rounded-full bg-green-500"
//                   style={{
//                     width: d.logged ? "100%" : "0%"
//                   }}
//                 />
//               </div>

//               <span className="text-sm">
//                 {d.logged ? "✔" : "—"}
//               </span>

//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   )
// }
