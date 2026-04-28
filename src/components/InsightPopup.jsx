import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"

export default function InsightPopup({ insight, onClose }) {
  const { session } = useAuth()
  const [topTriggers, setTopTriggers] = useState([])

  useEffect(() => {
    const fetchTopTriggers = async () => {
      if (!session?.user?.id) return

      try {
        const { data: meals, error } = await supabase
          .from("meals")
          .select("trigger_type")
          .eq("auth_id", session.user.id)
          .not("trigger_type", "is", null)

        if (error) throw error

        // Count trigger frequencies
        const triggerCounts = {}
        meals?.forEach((meal) => {
          if (meal.trigger_type) {
            triggerCounts[meal.trigger_type] = (triggerCounts[meal.trigger_type] || 0) + 1
          }
        })

        // Get top 3 triggers sorted by count
        const sorted = Object.entries(triggerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type, count]) => ({ type, count }))

        setTopTriggers(sorted)
      } catch (error) {
        console.error("Error fetching triggers:", error)
      }
    }

    if (insight?.content?.level === "day7") {
      fetchTopTriggers()
    }
  }, [session?.user?.id, insight])

  const TRIGGER_EMOJIS = {
    hunger: "🍽️",
    bored: "😐",
    stressed: "😣",
    good_mood: "😊",
    social: "👥",
    habit: "🔁",
    craving: "😋"
  }

  if (!insight) return null

  const level = insight.content?.level
  const isDay3 = level === "day3"
  const isDay7 = level === "day7"

  const renderDay3Content = () => (
    <>
      <div className="w-9 h-1 bg-gray-200 rounded mx-auto mb-4" />

      <div className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
        🧠 Day 3 — Early pattern
      </div>

      <h2 className="text-[17px] font-bold text-[#1a1a2e] leading-snug mb-2">
        Amazing — 3 days of logging. You're on a roll.
      </h2>

      <p className="text-[12px] text-gray-400 mb-3">
        This is what we've seen so far.
      </p>

      <div className="bg-[#f8f7ff] border-l-4 border-[#7c5cbf] rounded-r-xl px-3 py-2.5 mb-3 text-[12px] text-[#4a4a6a] leading-relaxed">
        {insight.content.core_insight}
      </div>

      <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span>🔒</span>
          <span className="text-[11px] text-gray-400">Full insight unlocks in 11 days</span>
        </div>
        <div className="h-[3px] bg-gray-100 rounded overflow-hidden">
          <motion.div
            className="h-full rounded"
            style={{ background: "linear-gradient(135deg, #5b67ff, #ff8a3d)" }}
            animate={{ width: "20%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 text-[13px] font-semibold hover:bg-gray-200 transition"
      >
        Got it — keep logging
      </button>
    </>
  )

  const renderDay7Content = () => {
    const stats = insight.content.stats || {}
    return (
      <>
        <div className="w-9 h-1 bg-gray-200 rounded mx-auto mb-4" />

        <div className="inline-block bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
          📊 Day 7 — Pattern confirmed
        </div>

        <h2 className="text-[17px] font-bold text-[#1a1a2e] leading-snug mb-2">
          One week in. Here's what your data says.
        </h2>

        <p className="text-[12px] text-gray-400 mb-3">
          {insight.content.core_insight}
        </p>

        <div className="bg-[#f8f7ff] border-l-4 border-[#7c5cbf] rounded-r-xl px-3 py-2.5 mb-3 text-[12px] text-[#4a4a6a] leading-relaxed">
          {insight.content.explanation}
        </div>

        <div className="flex gap-2 mb-3">
          {[
            { label: "Days logged", value: stats.days_logged || "—" },
            { label: "Avg meal time", value: stats.avg_meal_time || "—" },
            { label: "Single meal days", value: stats.single_meal_days || "—" }
          ].map((stat, idx) => (
            <div key={idx} className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <div className="text-[14px] font-bold text-[#1a1a2e]">{stat.value}</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top triggers */}
        {topTriggers.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Your top triggers
            </p>
            <div className="space-y-1.5">
              {topTriggers.map((trigger, idx) => {
                const maxCount = topTriggers[0]?.count || 1
                const percentage = (trigger.count / maxCount) * 100
                const triggerLabel = trigger.type.replace(/_/g, " ")

                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-[#1a1a2e]">
                        {TRIGGER_EMOJIS[trigger.type]} {triggerLabel}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">{trigger.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            trigger.type === "hunger"
                              ? "linear-gradient(135deg, #7c6cff, #5b67ff)"
                              : trigger.type === "bored"
                              ? "linear-gradient(135deg, #ff8a3d, #ffa500)"
                              : trigger.type === "stressed"
                              ? "linear-gradient(135deg, #ef4444, #dc2626)"
                              : trigger.type === "good_mood"
                              ? "linear-gradient(135deg, #10b981, #059669)"
                              : trigger.type === "social"
                              ? "linear-gradient(135deg, #f59e0b, #f97316)"
                              : trigger.type === "habit"
                              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                              : "linear-gradient(135deg, #ec4899, #f43f5e)"
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-[#f8f7ff] border-l-4 border-[#7c5cbf] rounded-r-xl px-3 py-2.5 mb-3 text-[12px] text-[#6b6b80] leading-relaxed">
          {insight.content.why_it_matters}
        </div>

        {insight.content.highlight && (
          <p className="text-[11px] text-gray-400 italic mb-3">
            {insight.content.highlight}
          </p>
        )}

        <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span>🔒</span>
            <span className="text-[11px] text-gray-400">7 days until next milestone</span>
          </div>
          <div className="h-[3px] bg-gray-100 rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{ background: "linear-gradient(135deg, #5b67ff, #ff8a3d)" }}
              animate={{ width: "50%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 text-[13px] font-semibold hover:bg-gray-200 transition"
        >
          Got it — keep logging
        </button>
      </>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-end bg-black/55 backdrop-blur-[3px] px-4 pb-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.85, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-white rounded-[24px] p-[22px] shadow-lg"
        >
          {isDay3 && renderDay3Content()}
          {isDay7 && renderDay7Content()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
