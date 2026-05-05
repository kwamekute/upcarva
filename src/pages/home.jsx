import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"

import { useData } from "../contexts/DataContext"
import { supabase } from "../lib/supabase"
import { useUserProfile } from "../hooks/useUserProfile"
import { useTodayMeals } from "../hooks/useTodayMeals"
import { useMealLogs } from "../hooks/useMealLogs"
import { useInsights } from "../hooks/useInsights"
import StreakCard from "../components/StreakCard"
import Toast from "../components/Toast"
import InsightPopup from "../components/InsightPopup"
import CompletionModal from "../components/CompletionModal"
import Phase2Home from "../components/Phase2Home"

// Mock insights for testing — set SIMULATION_MODE to "day3", "day7", "day14", "day15", or null to use real data
// For autonomous testing, also override SIMULATION_CURRENT_DAY to force currentDay to a specific value
// const SIMULATION_MODE = null
// const SIMULATION_CURRENT_DAY = 3// null = use real logs, or set to 3, 7, 14, 15, etc for testing
const SIMULATE_DAY = null // e.g. 3, 7, 15
const USE_MOCK_INSIGHTS = false

const MOCK_INSIGHTS = {
  day3: {
    id: "test-day3",
    user_id: "test",
    phase: "discovery",
    day: 3,
    type: "checkpoint",
    is_read: false,
    content: {
      level: "day3",
      core_insight: "You tend to eat your first meal late in the day"
    }
  },
  day7: {
    id: "test-day7",
    user_id: "test",
    phase: "discovery",
    day: 7,
    type: "checkpoint",
    is_read: false,
    content: {
      level: "day7",
      core_insight: "You eat once a day — usually in the evening",
      explanation: "This leads to arriving very hungry, making overeating more likely",
      why_it_matters: "Spreading food earlier reduces evening hunger and improves control",
      highlight: "Your food choices are solid — timing is the main issue",
      stats: {
        days_logged: 6,
        avg_meal_time: "7pm",
        single_meal_days: 5
      }
    }
  }
  // day14: {
  //   id: "test-day14",
  //   user_id: "test",
  //   phase: "discovery",
  //   day: 14,
  //   type: "summary",
  //   is_read: false,
    // content: {
    //   level: "day14",
    //   profile: {
    //     name: "Kwaw",
    //     age: 30,
    //     height: "6'2\" (188cm)",
    //     est_weight: "~100–115kg",
    //     goal: "Lean physique & sustained energy",
    //     period: "April 2026"
    //   },
    //   body_composition: {
    //     body_fat_pct: "28–33%",
    //     body_fat_plain: "Common for your height and build with gradual gain from early 20s.",
    //     fat_mass: "~28–38kg",
    //     fat_mass_plain: "Wide range because weight is an estimate. Weekly logging in Phase 2 sharpens this.",
    //     lean_mass: "~72–82kg",
    //     lean_mass_plain: "Your muscle, bone and organs. That lean foundation from before 22 is still there.",
    //     fat_to_lose: "~18–25kg",
    //     fat_to_lose_plain: "At 12–15% body fat you'd be back to the lean build from your earlier years.",
    //     timeline: "8–14 months",
    //     timeline_plain: "Your height and lean mass mean you can move faster without losing muscle.",
    //     missing_data_callout: "Your weight. You estimated 100–115kg but never stepped on a scale across 14 days. Weigh yourself once a week in Phase 2 — same time, same conditions, first thing in the morning."
    //   },
    //   scores: {
    //     logging: { value: 100, color: "teal", label: "Logging Consistency", note: "Every single day logged — all 14. Best consistency score in the cohort. Even during a 7-hour bus journey, you logged." },
    //     detail: { value: 88, color: "purple", label: "Log Detail", note: "Genuinely descriptive logs — mood, hunger, situation. Main gap: quantities. 'A bowl of rice' tells us less than '250g of rice'." },
    //     timing: { value: 78, color: "blue", label: "Meal Timing", note: "On normal days: excellent. 9–10am breakfast, 4–5pm second meal. Travel days disrupted this noticeably." },
    //     nutrition: { value: 55, color: "amber", label: "Nutrition Balance", note: "Food choices aren't bad — but heavily weighted toward carbs on travel days and weekends." }
    //   },
    //   macros_current: { carbs: 58, protein: 22, fat: 20 },
    //   macros_target: { carbs: 30, protein: 42, fat: 28 },
    //   macro_highlight: "Your breakfast is the best meal of the day — protect it. Porridge with 2 eggs and sardine every weekday morning is genuinely strong. The problem isn't your breakfast — the rest of the day doesn't match it yet.",
    //   patterns: [
    //     {
    //       color: "teal",
    //       title: "Your routine is your biggest advantage — and it's already working",
    //       body: "Porridge, eggs and sardine at 9–10am every workday. Oiled rice or jollof with chicken at 4–5pm most afternoons. 'Amelia' — your porridge seller — is an unsung hero. The task in Phase 2 is to build the same structure into your second meal."
    //     },
    //     {
    //       color: "amber",
    //       title: "Travel days completely break your pattern — and that needs a plan",
    //       body: "Days 8–10 were 7–8 hour bus journeys. 3 disrupted days out of 14 is a 21% disruption rate. Over six months that's significant. Phase 2 includes building a travel eating protocol."
    //     },
    //     {
    //       color: "orange",
    //       title: "Carbs stack on top of each other without you noticing",
    //       body: "April 4: bread and eggs, then rice with gravy, then mashed kenkey. Three starchy carbs in one day. The fix: one carb source per day, smaller portion. Protein and vegetables fill the rest."
    //     },
    //     {
    //       color: "purple",
    //       title: "Your protein is better than most — but your size demands significantly more",
    //       body: "~80–95g per day currently. You need 155–175g at your weight and height. Add a third egg to breakfast, larger chicken portions at your second meal, sardines on travel days."
    //     },
    //     {
    //       color: "red",
    //       title: "Hunger headaches are a warning sign your meal gap is too long",
    //       body: "Mentioned twice. Going more than 6–7 hours without food at your activity level causes a blood sugar drop. Time your two meals so the gap never exceeds this window."
    //     },
    //     {
    //       color: "blue",
    //       title: "Water doesn't appear once in 14 days of logs",
    //       body: "Not a single mention across 14 days. For a man of your size, minimum daily intake is 3–4 litres. Mild dehydration causes exactly the headaches you described. This is a free and immediate win."
    //     }
    //   ],
    //   experiments: [
    //     {
    //       label: "Exp A",
    //       color: "teal",
    //       title: "Build a travel eating protocol",
    //       body: "Before your next long journey: 3 boiled eggs, a handful of peanuts, a bottle of water. Log it as Meal 1 at your normal time even on a bus. The goal is to keep your two-meal structure intact on travel days."
    //     },
    //     {
    //       label: "Exp B",
    //       color: "purple",
    //       title: "One carb source per day",
    //       body: "For 7 days, allow yourself one starchy carb — rice, yam, plantain, bread or kenkey. Choose the one you want most that day. Protein and vegetables fill the rest of both meals."
    //     },
    //     {
    //       label: "Exp C",
    //       color: "amber",
    //       title: "Give your second meal a formula",
    //       body: "Your breakfast has a formula and never changes. For 7 days, give your second meal one too: protein (chicken or fish) + one carb (smaller) + vegetables. Log whether a formula makes it easier."
    //     }
    //   ],
    //   missing_data_improvements: [
    //     "Daily or weekly weight — the single most important missing data point",
    //     "Water intake — log it daily starting with 2.5 litres as a target",
    //     "Meal quantities — '250g of rice' tells us far more than 'a bowl of rice'",
    //     "How you felt after meals — energy levels, fullness, cravings 2 hours later",
    //     "Sleep quality — you logged bedtimes but not how rested you felt",
    //     "Travel day planning — log what you intend to eat before you travel"
    //   ],
    //   closing: "Most people trying to change their eating don't have a consistent breakfast, don't log every day, and don't have a clear structure. You have all three already. Phase 2 is not starting from scratch — it's taking what already works and extending it to the rest of your day. The foundation is solid. Now we build on it.",
    //   disclaimer: "This is an observational report based on food logs recorded during a 14-day self-reporting period. It is not a medical report or clinical assessment. All figures are approximations based on self-reported data — they are guides, not guarantees. Upcarva is a nutrition coaching and behaviour change programme, not a medical service."
    // }
  }
//}

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const { silentRefetch } = useData()
  const { meals, hasLoggedToday } = useTodayMeals()
  const { streak, isStreakAtRisk, logs, challengeDays } = useMealLogs()
  const { unreadInsight, markAsRead } = useInsights()

  // Simulate day 14/15 for testing
  const testChallengeDays = SIMULATE_DAY !== null
  //? Math.min(SIMULATION_CURRENT_DAY, 14)
  ? SIMULATE_DAY
  : challengeDays
  
    const [currentDay, setCurrentDay] = useState(1)

  
 // const testCurrentDay = SIMULATION_CURRENT_DAY !== null ? SIMULATION_CURRENT_DAY : currentDay
const testCurrentDay = SIMULATE_DAY ?? currentDay

  const [text, setText] = useState("")
  const [hungerLevel, setHungerLevel] = useState(null)
  const [triggerType, setTriggerType] = useState(null)
  const [cost, setCost] = useState("")
  const [mealTime, setMealTime] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [completionShown, setCompletionShown] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showInsightPopup, setShowInsightPopup] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const phase2Preview =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).has("phase2") ||
      localStorage.getItem("upcarva_phase2_preview") === "true")
  const phase1Preview =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).has("phase1") ||
      localStorage.getItem("upcarva_phase_override") === "phase1")
  const isPhase2 = !phase1Preview && (!!profile?.phase2_unlocked || phase2Preview)

  // Load completion modal flag from localStorage on mount
  useEffect(() => {
    const shown = localStorage.getItem("completion_shown_14")
    if (shown === "true") {
      setCompletionShown(true)
    }
  }, [])

  // Use simulated insight if SIMULATION_MODE is set, otherwise use real unreadInsight
 // const activeInsight = SIMULATION_MODE ? MOCK_INSIGHTS[SIMULATION_MODE] : unreadInsight
//  let activeInsight = null

// if (SIMULATION_MODE) {
//   activeInsight = MOCK_INSIGHTS[SIMULATION_MODE]
// } else {
//   // REAL LOGIC (delayed insight delivery)
//   if (testCurrentDay === 4 && unreadInsight?.day === 3) {
//     activeInsight = unreadInsight
//   } else if (testCurrentDay === 8 && unreadInsight?.day === 7) {
//     activeInsight = unreadInsight
//   } else if (testCurrentDay >= 15 && unreadInsight?.day === 14) {
//     activeInsight = unreadInsight
//   }
// }
//const isSimulating = SIMULATION_MODE !== null

let activeInsight = null

if (USE_MOCK_INSIGHTS) {
  activeInsight = MOCK_INSIGHTS[SIMULATE_DAY] 
} else {
  const insightDay = Number(unreadInsight?.day)

  if (testCurrentDay === 4 && insightDay === 3) {
    activeInsight = unreadInsight
  } else if (testCurrentDay === 8 && insightDay === 7) {
    activeInsight = unreadInsight
  } else if (testCurrentDay >= 15 && insightDay === 14) {
    activeInsight = unreadInsight
  }
}

console.log({
  USE_MOCK_INSIGHTS
})
  // Calculate current day in challenge
  useEffect(() => {
    if (logs && logs.length > 0) {
      const uniqueDays = new Set(logs.map((log) => log.log_date)).size
      setCurrentDay(Math.max(uniqueDays, 1))
    }
  }, [logs])

  // Get reinforcement message based on current day
  const getReinforcementMessage = () => {
    if (testCurrentDay <= 2) {
      return "Keep logging — we're collecting your patterns."
    } else if (testCurrentDay === 3) {
      return "Early signal spotted — keep logging to see it sharpen."
    } else if (testCurrentDay >= 4 && testCurrentDay <= 6) {
      return "We're seeing more patterns — keep logging. Day 7 unlocks more."
    } else if (testCurrentDay === 7) {
      return "A pattern is forming. Keep logging to confirm it."
    } else if (testCurrentDay >= 8 && testCurrentDay <= 10) {
      const daysUntilReport = 14 - testCurrentDay
      return `Pattern confirmed — full report unlocks in ${daysUntilReport} ${daysUntilReport === 1 ? "day" : "days"}`
    } else if (testCurrentDay >= 11 && testCurrentDay <= 13) {
      return "We're excited — report is almost ready. Keep logging."
    } else if (testCurrentDay === 14) {
      return "You've built the habit — log the last day to unlock results."
    } else if (testCurrentDay >= 15) {
      return "Your pattern is clear — full report ready."
    }
    return null
  }

  
  const message = getReinforcementMessage()

  const getButtonText = () => {
    if (testChallengeDays > 14) return "View your Phase 1 report →"
    if (isStreakAtRisk) return "Don't break your streak 🔥"
    if (meals.length === 0 && streak === 0) return "Start your streak 🔥"
    if (meals.length === 0 && streak > 0) return "Log today - don't stop now"
    if (meals.length === 1) return "Add another meal"
    return "Anything else?"
  }

  const getButtonStyle = () => {
    if (testChallengeDays > 14) {
      return {
        background: "linear-gradient(135deg, #7c5cbf, #f97316)"
      }
    }
    if (isStreakAtRisk) return { background: "#ef4444" }
    if (meals.length === 0 && streak > 0) return { background: "#f97316" }
    if (meals.length >= 1) return { background: "#22c55e" }
    return { background: "var(--grad)" }
  }

  const handleCTAClick = () => {
    if (testChallengeDays > 14) {
      navigate("/report")
    } else {
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setText("")
    setHungerLevel(null)
    setTriggerType(null)
    setCost("")
    setMealTime("")
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setToastVisible(true)
  }

  useEffect(() => {
    if (!toastVisible) return

    const timeout = window.setTimeout(() => setToastVisible(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [toastVisible])

  // Auto-select 'hunger' trigger only when hunger level is 3
  useEffect(() => {
    if (hungerLevel === 3 && triggerType === null) {
      setTriggerType("hunger")
    }
  }, [hungerLevel])

  const addMeal = async () => {
    if (!text.trim() || hungerLevel === null || triggerType === null || saving) return

    setSaving(true)

    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) {
        setSaving(false)
        return
      }

      const today = new Date().toISOString().split("T")[0]
      
      // If user specified a time, use that; otherwise use current time
      let eatenAt
      if (mealTime) {
        eatenAt = `${today}T${mealTime}:00Z`
      } else {
        eatenAt = new Date().toISOString()
      }
      
      const { error } = await supabase.from("meals").insert([
        {
          auth_id: user.id,
          description: text,
          hunger_level: hungerLevel,
          trigger_type: triggerType,
          cost: cost ? parseFloat(cost) : null,
          log_date: today,
          eaten_at: eatenAt
        }
      ])

      if (error) {
        console.error(error)
        setSaving(false)
        return
      }

      setText("")
      setHungerLevel(null)
      setTriggerType(null)
      setCost("")
      setMealTime("")
      silentRefetch()
      setShowModal(false)
      setSaving(false)
      const newMealCount = meals.length + 1
      if (newMealCount === 1) {
        showToast(`Day ${streak + 1} started 🔥`)
        // Show insight pop-up 800ms after first meal toast
        if (activeInsight) {
          setTimeout(() => setShowInsightPopup(true), 800)
        }
      } else if (newMealCount === 2) {
        showToast("💪 Keep the momentum!")
      } else if (newMealCount === 3) {
        showToast("🚀 You're on fire!")
      } else {
        showToast(`Logged ✅`)
      }

      // Day 15 completion check (after 14 days logged, show on day 15)
      if (currentDay > 14 && !completionShown) {
        setTimeout(() => {
          setShowCompletion(true)
          setCompletionShown(true)
          localStorage.setItem("completion_shown_14", "true")
        }, 800)
      }
    } catch (error) {
      console.error(error)
      setSaving(false)
    }
  }

  if (isPhase2) {
    return <Phase2Home />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] px-4 py-5">
      <Toast message={toastMsg} visible={toastVisible} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#7c6cff]/12 blur-3xl" />
        <div className="absolute bottom-10 right-[-40px] h-[180px] w-[180px] rounded-full bg-[#ff8a3d]/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-sm space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-[24px] border border-white/80 bg-white/75 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <span
                className="text-lg font-black tracking-tight"
                style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                upcarva
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                {testChallengeDays > 14
                  ? `14 days. You built the habit, ${profile?.name}. 🎯`
                  : hasLoggedToday
                    ? `You showed up today${profile?.name ? `, ${profile.name}` : ""}.`
                    : `Keep today moving${profile?.name ? `, ${profile.name}` : ""}.`}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                testCurrentDay > 14
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {testCurrentDay > 14 ? "14 / 14 ✓" : `${testChallengeDays} / 14 days`}
            </span>
          </div>

          <div className={`mt-3 h-[4px] overflow-hidden rounded-full ${testCurrentDay > 14 ? "bg-green-200" : "bg-slate-100"}`}>
            <motion.div
              className={`h-full rounded-full ${testCurrentDay > 14 ? "bg-green-500" : ""}`}
              style={
                testCurrentDay > 14 ? {} : { background: "var(--grad)" }
              }
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((testChallengeDays / 14) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`mt-3 flex items-center justify-center gap-2 text-[11px] ${
                testCurrentDay > 14 ? "text-teal-600" : "text-gray-500"
              }`}
            >
              <span className={testCurrentDay > 14 ? "text-teal-500" : ""}>
                {testCurrentDay > 14 ? "●" : "●"}
              </span>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, linear: true }}
                className="text-sm"
              >
                ⚙️
              </motion.span>
              <span>{message}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
        >
          <StreakCard
            streak={streak}
            hasLoggedToday={hasLoggedToday}
            isStreakAtRisk={isStreakAtRisk}
            logs={logs}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {!showModal && (
            <motion.button
              key="cta"
              onClick={handleCTAClick}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={isStreakAtRisk 
                ? { opacity: 1, y: 0, scale: 1, x: [0, -3, 3, -2, 2, 0] } 
                : { opacity: 1, y: 0, scale: 1 }
              }
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={isStreakAtRisk 
                ? { duration: 0.4, x: { duration: 0.6, repeat: Infinity, repeatDelay: 2 } }
                : { duration: 0.24, ease: "easeOut" }
              }
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              className="w-full rounded-xl py-3 text-[12px] font-bold text-white shadow-[0_14px_28px_rgba(91,103,255,0.24)] transition-transform active:scale-[0.94]"
              style={getButtonStyle()}
            >
              {getButtonText()}
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_18px_48px_rgba(15,23,42,0.07)] backdrop-blur-xl"
        >
          {meals.length === 0 ? (
            <p className="py-5 text-center text-[11px] leading-relaxed text-slate-400">
              Nothing yet. Your first log starts everything.
            </p>
          ) : (
            meals.sort((a, b) => new Date(a.eaten_at) - new Date(b.eaten_at)).map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 12, x: -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.05 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.015)", x: 2 }}
                className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 transition-colors"
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#7c6cff]/20 to-[#ff8a3d]/20 text-[9px] font-semibold text-slate-600"
                >
                  {i + 1}
                </motion.div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-800">{meal.description}</p>
                  <p className="mt-0.5 text-[9px] text-slate-400">
                    {new Date(meal.eaten_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            key="log-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/28 px-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Log meal</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-800">Nice. Let&apos;s log it.</h2>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white shadow-[0_12px_28px_rgba(91,103,255,0.28)]"
                  style={{ background: "var(--grad)" }}
                >
                  🍽️
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
                    Food &amp; Quantity
                  </label>
                  <input
                    autoFocus
                    placeholder="Food & Quantity e.g(about half plate of rice..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-800 outline-none transition focus:border-[#7c6cff]/40 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-medium text-slate-600">
                    Hunger Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { level: 0, emoji: "😐", label: "Not" },
                      { level: 1, emoji: "🙂", label: "Bit" },
                      { level: 2, emoji: "😋", label: "Yes" },
                      { level: 3, emoji: "🔥", label: "Starving" }
                    ].map((item) => (
                      <motion.button
                        key={item.level}
                        onClick={() => setHungerLevel(item.level)}
                        whileTap={{ scale: 0.95 }}
                        className={`rounded-lg border-2 py-2.5 text-center transition-all ${
                          hungerLevel === item.level
                            ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200"
                            : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-lg">{item.emoji}</div>
                        <div className="mt-1 text-[9px] font-medium">{item.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {hungerLevel !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <label className="mb-2 block text-[11px] font-medium text-slate-600">
                      What triggered you?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { type: "hunger", emoji: "🍽️", label: "Hunger" },
                        { type: "bored", emoji: "😐", label: "Bored" },
                        { type: "stressed", emoji: "😣", label: "Stressed" },
                        { type: "good_mood", emoji: "😊", label: "Good Mood" },
                        { type: "social", emoji: "👥", label: "Social" },
                        { type: "habit", emoji: "🔁", label: "Habit" },
                        { type: "craving", emoji: "😋", label: "Craving" }
                      ].map((item) => (
                        <motion.button
                          key={item.type}
                          onClick={() => setTriggerType(triggerType === item.type ? null : item.type)}
                          whileTap={{ scale: 0.95 }}
                          className={`rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all ${
                            triggerType === item.type
                              ? "border-orange-300 bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span>{item.emoji}</span> <span className="ml-1">{item.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
                    Cost (optional)
                  </label>
                  <input
                    placeholder="Cost (optional)"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-800 outline-none transition focus:border-[#7c6cff]/40 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
                    Time eaten (incase you want to log a past meal)
                  </label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-800 outline-none transition focus:border-[#7c6cff]/40 focus:bg-white"
                  />
                  <p className="mt-1 text-[9px] text-slate-400">Leave blank to use current time</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={addMeal}
                  whileTap={{ scale: 0.98 }}
                  disabled={!text.trim() || hungerLevel === null || triggerType === null || saving}
                  className="flex-[1.5] rounded-xl py-2.5 text-[11px] font-semibold text-white disabled:opacity-40"
                  style={{ background: "var(--grad)" }}
                >
                  {saving ? "Saving..." : "Save Meal"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInsightPopup && activeInsight && (
          <InsightPopup
            insight={activeInsight}
            onClose={() => {
              setShowInsightPopup(false)
              // Only mark as read in DB if not in simulation mode
              if (!USE_MOCK_INSIGHTS && activeInsight.id) {
                markAsRead(activeInsight.id)
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 2 report link */}
      {testCurrentDay > 14 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex justify-center"
        >
          <button
            onClick={() => navigate("/report")}
            className="text-[10px] text-gray-400 underline transition hover:text-gray-600"
          >
            ← View Phase 1 report
          </button>
        </motion.div>
      )}

      <CompletionModal
        show={showCompletion}
        onClose={() => {
          setShowCompletion(false)
          navigate("/report")
        }}
      />
    </div>
  )
}
