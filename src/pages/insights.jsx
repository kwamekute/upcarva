import { motion } from "framer-motion"
import { useInsights } from "../hooks/useInsights"

export default function Insights() {
  const { insights } = useInsights()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

  return (
    <div className="relative min-h-screen bg-[#f5f6fa] px-4 py-6">
      <div className="max-w-sm mx-auto">
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
