import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useInsights } from "../hooks/useInsights"
import { useMealLogs } from "../hooks/useMealLogs"
import { useAuth } from "../hooks/useAuth"
import { supabase } from "../lib/supabase"

export default function Insights() {
  const { insights } = useInsights()
  const { session } = useAuth()
  const { logs } = useMealLogs()
  const [triggersByInsight, setTriggersByInsight] = useState({})
  const [currentDay, setCurrentDay] = useState(1)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Calculate current day in challenge
  useEffect(() => {
    if (logs && logs.length > 0) {
      // Get unique days logged
      const uniqueDays = new Set(logs.map((log) => log.log_date)).size
      setCurrentDay(Math.max(uniqueDays, 1))
    }
  }, [logs])

  // Get reinforcement message based on current day
  const getReinforcementMessage = () => {
    if (currentDay <= 2) {
      return {
        text: "Keep logging — we're collecting your patterns.",
        subtext: null,
        showDots: true
      }
    } else if (currentDay === 3) {
      return {
        text: "Early signal spotted — keep logging to see it sharpen.",
        subtext: null,
        showDots: true
      }
    } else if (currentDay >= 4 && currentDay <= 6) {
      return {
        text: "We're seeing more patterns — keep logging.",
        subtext: "Day 7 unlocks more.",
        showDots: true
      }
    } else if (currentDay === 7) {
      return {
        text: "A pattern is forming.",
        subtext: "Keep logging to confirm it.",
        showDots: true
      }
    } else if (currentDay >= 8 && currentDay <= 10) {
      const daysUntilReport = 14 - currentDay
      return {
        text: "Pattern confirmed — full report unlocks in",
        subtext: `${daysUntilReport} ${daysUntilReport === 1 ? "day" : "days"}`,
        showDots: true
      }
    } else if (currentDay >= 11 && currentDay <= 13) {
      return {
        text: "We're excited — report is almost ready.",
        subtext: "Keep logging.",
        showDots: true
      }
    } else if (currentDay >= 14) {
      return {
        text: "You did it! Tomorrow you get the full picture.",
        subtext: null,
        showDots: true
      }
    }
    return { text: null, subtext: null, showDots: false }
  }

  const TRIGGER_EMOJIS = {
    hunger: "🍽️",
    bored: "😐",
    stressed: "😣",
    good_mood: "😊",
    social: "👥",
    habit: "🔁",
    craving: "😋"
  }

  useEffect(() => {
    const fetchAllTriggers = async () => {
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
        const topTriggers = Object.entries(triggerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type, count]) => ({ type, count }))

        // Set triggers for all Day 7 insights
        const triggers = {}
        insights.forEach((insight) => {
          if (insight.content?.level === "day7") {
            triggers[insight.id] = topTriggers
          }
        })
        setTriggersByInsight(triggers)
      } catch (error) {
        console.error("Error fetching triggers:", error)
      }
    }

    fetchAllTriggers()
  }, [session?.user?.id, insights])

  const renderTriggerBars = (insightId) => {
    const triggers = triggersByInsight[insightId] || []
    if (triggers.length === 0) return null

    // Calculate total count for percentage
    const totalCount = triggers.reduce((sum, t) => sum + t.count, 0)

    return (
      <div className="mb-3">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Your top triggers
        </p>
        <div className="space-y-2">
          {triggers.map((trigger, idx) => {
            const percentage = Math.round((trigger.count / totalCount) * 100)
            const triggerLabel = trigger.type.replace(/_/g, " ")

            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-[#1a1a2e]">
                    {TRIGGER_EMOJIS[trigger.type]} {triggerLabel}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        trigger.type === "hunger"
                          ? "#10b981"
                          : trigger.type === "bored"
                          ? "#ff8a3d"
                          : trigger.type === "stressed"
                          ? "#ef4444"
                          : trigger.type === "good_mood"
                          ? "#10b981"
                          : trigger.type === "social"
                          ? "#f59e0b"
                          : trigger.type === "habit"
                          ? "#6366f1"
                          : "#ec4899"
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
    )
  }

  const renderInsightCard = (insight) => {
    const level = insight.content?.level
    const isDay3 = level === "day3"
    const isDay7 = level === "day7"

    return (
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-100"
      >
        {/* Top row: badge + date */}
        <div className="flex justify-between items-center mb-2">
          <div
            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isDay3
                ? "bg-orange-50 text-orange-600"
                : isDay7
                ? "bg-indigo-50 text-indigo-600"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            {isDay3 && "🧠 Day 3"}
            {isDay7 && "📊 Day 7"}
          </div>
          <span className="text-[10px] text-gray-400">{formatDate(insight.created_at)}</span>
        </div>

        {/* Core insight */}
        <p className="text-[13px] font-medium text-[#1a1a2e] leading-relaxed mb-2">
          {insight.content.core_insight}
        </p>

        {/* Day 3 content */}
        {isDay3 && (
          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-2">
            <span>🔒</span>
            More detail unlocks at Day 7
          </div>
        )}

        {/* Day 7 content */}
        {isDay7 && (
          <>
            {/* Explanation */}
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
              {insight.content.explanation}
            </p>

            {/* Stats row */}
            {insight.content.stats && (
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-[14px] font-bold text-[#1a1a2e]">
                    {insight.content.stats.days_logged}
                  </div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">Days logged</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-[14px] font-bold text-[#1a1a2e]">
                    {insight.content.stats.avg_meal_time}
                  </div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">Avg meal</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-[14px] font-bold text-[#1a1a2e]">
                    {insight.content.stats.single_meal_days}
                  </div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">Single meal</div>
                </div>
              </div>
            )}

            {/* Trigger bars */}
            {renderTriggerBars(insight.id)}

            {/* Why it matters */}
            <div className="bg-[#f8f7ff] border-l-4 border-[#7c5cbf] rounded-r-lg px-3 py-2 mb-2 text-[11px] text-[#6b6b80] leading-relaxed">
              {insight.content.why_it_matters}
            </div>

            {/* Highlight */}
            {insight.content.highlight && (
              <p className="text-[11px] text-gray-400 italic">
                {insight.content.highlight}
              </p>
            )}
          </>
        )}
      </motion.div>
    )
  }

  const message = getReinforcementMessage()

  return (
    <div className="relative min-h-screen bg-[#f5f6fa] px-4 py-6">
      <div className="max-w-sm mx-auto">
        {/* Reinforcement Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {message.showDots && (
                <>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-lg"
                  >
                    ✨
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="text-lg"
                  >
                    ✨
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    className="text-lg"
                  >
                    ✨
                  </motion.span>
                </>
              )}
            </div>
            <p className="text-[12px] font-medium text-[#1a1a2e] leading-relaxed">
              {message.text}
            </p>
            {message.subtext && (
              <p className="text-[11px] text-gray-400 mt-1">{message.subtext}</p>
            )}
          </motion.div>
        )}

        {insights.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-[13px] font-medium text-[#1a1a2e] mb-1">
              Your first insight unlocks after Day 3.
            </p>
            <p className="text-[11px] text-gray-400">
              Keep logging — we're collecting your patterns.
            </p>
          </div>
        ) : (
          <div>
            {insights.map((insight) => renderInsightCard(insight))}
          </div>
        )}
      </div>
    </div>
  )
}
