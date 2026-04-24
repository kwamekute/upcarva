import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useData } from "../contexts/DataContext"
import { supabase } from "../lib/supabase"
import { useUserProfile } from "../hooks/useUserProfile"
import { useTodayMeals } from "../hooks/useTodayMeals"
import { useMealLogs } from "../hooks/useMealLogs"
import StreakCard from "../components/StreakCard"
import Toast from "../components/Toast"

export default function Home() {
  const { profile } = useUserProfile()
  const { silentRefetch } = useData()
  const { meals, hasLoggedToday } = useTodayMeals()
  const { streak, isStreakAtRisk, logs, challengeDays } = useMealLogs()
  const [text, setText] = useState("")
  const [hungerLevel, setHungerLevel] = useState(null)
  const [triggerType, setTriggerType] = useState(null)
  const [cost, setCost] = useState("")
  const [mealTime, setMealTime] = useState("") // Empty = use current time
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [toastVisible, setToastVisible] = useState(false)

  const getButtonText = () => {
    if (isStreakAtRisk) return "Don't break your streak 🔥"
    if (meals.length === 0 && streak === 0) return "Start your streak 🔥"
    if (meals.length === 0 && streak > 0) return "Log today - don't stop now"
    if (meals.length === 1) return "Add another meal"
    return "Anything else?"
  }

  const getButtonStyle = () => {
    if (isStreakAtRisk) return { background: "#ef4444" }
    if (meals.length === 0 && streak > 0) return { background: "#f97316" }
    if (meals.length >= 1) return { background: "#22c55e" }
    return { background: "var(--grad)" }
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

  // Auto-select 'hunger' trigger when hunger level is 3
  useEffect(() => {
    if (hungerLevel === 3 && triggerType === null) {
      setTriggerType("hunger")
    } else if (hungerLevel !== 3 && triggerType === "hunger") {
      setTriggerType(null)
    }
  }, [hungerLevel, triggerType])

  const addMeal = async () => {
    if (!text.trim() || hungerLevel === null || saving) return

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
      } else if (newMealCount === 2) {
        showToast("💪 Keep the momentum!")
      } else if (newMealCount === 3) {
        showToast("🚀 You're on fire!")
      } else {
        showToast(`Logged ✅`)
      }
    } catch (error) {
      console.error(error)
      setSaving(false)
    }
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
                {hasLoggedToday ? `You showed up today${profile?.name ? `, ${profile.name}` : ""}.` : `Keep today moving${profile?.name ? `, ${profile.name}` : ""}.`}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-500">
              {challengeDays} / 14 days
            </span>
          </div>

          <div className="mt-3 h-[4px] overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--grad)" }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((challengeDays / 14) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
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
              onClick={() => setShowModal(true)}
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
                  disabled={!text.trim() || hungerLevel === null || saving}
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
    </div>
  )
}
