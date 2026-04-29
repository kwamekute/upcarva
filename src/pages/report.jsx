import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useInsights } from "../hooks/useInsights"
import { useData } from "../contexts/DataContext"

const SIMULATION_MODE = "day14"
//const SIMULATION_CURRENT_DAY = 15 // null = use real logs, or set to 3, 7, 14, 15, etc for testing

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
  },
  day14: {
    id: "test-day14",
    user_id: "test",
    phase: "discovery",
    day: 14,
    type: "summary",
    is_read: false,
    content: {
      level: "day14",
      profile: {
        name: "Kwaw",
        age: 30,
        height: "6'2\" (188cm)",
        est_weight: "~100–115kg",
        goal: "Lean physique & sustained energy",
        period: "April 2026"
      },
      body_composition: {
        body_fat_pct: "28–33%",
        body_fat_plain: "Common for your height and build with gradual gain from early 20s.",
        fat_mass: "~28–38kg",
        fat_mass_plain: "Wide range because weight is an estimate. Weekly logging in Phase 2 sharpens this.",
        lean_mass: "~72–82kg",
        lean_mass_plain: "Your muscle, bone and organs. That lean foundation from before 22 is still there.",
        fat_to_lose: "~18–25kg",
        fat_to_lose_plain: "At 12–15% body fat you'd be back to the lean build from your earlier years.",
        timeline: "8–14 months",
        timeline_plain: "Your height and lean mass mean you can move faster without losing muscle.",
        missing_data_callout: "Your weight. You estimated 100–115kg but never stepped on a scale across 14 days. Weigh yourself once a week in Phase 2 — same time, same conditions, first thing in the morning."
      },
      scores: {
        logging: { value: 100, color: "teal", label: "Logging Consistency", note: "Every single day logged — all 14. Best consistency score in the cohort. Even during a 7-hour bus journey, you logged." },
        detail: { value: 88, color: "purple", label: "Log Detail", note: "Genuinely descriptive logs — mood, hunger, situation. Main gap: quantities. 'A bowl of rice' tells us less than '250g of rice'." },
        timing: { value: 78, color: "blue", label: "Meal Timing", note: "On normal days: excellent. 9–10am breakfast, 4–5pm second meal. Travel days disrupted this noticeably." },
        nutrition: { value: 55, color: "amber", label: "Nutrition Balance", note: "Food choices aren't bad — but heavily weighted toward carbs on travel days and weekends." }
      },
      macros_current: { carbs: 58, protein: 22, fat: 20 },
      macros_target: { carbs: 30, protein: 42, fat: 28 },
      macro_highlight: "Your breakfast is the best meal of the day — protect it. Porridge with 2 eggs and sardine every weekday morning is genuinely strong. The problem isn't your breakfast — the rest of the day doesn't match it yet.",
      patterns: [
        {
          color: "teal",
          title: "Your routine is your biggest advantage — and it's already working",
          body: "Porridge, eggs and sardine at 9–10am every workday. Oiled rice or jollof with chicken at 4–5pm most afternoons. 'Amelia' — your porridge seller — is an unsung hero. The task in Phase 2 is to build the same structure into your second meal."
        },
        {
          color: "amber",
          title: "Travel days completely break your pattern — and that needs a plan",
          body: "Days 8–10 were 7–8 hour bus journeys. 3 disrupted days out of 14 is a 21% disruption rate. Over six months that's significant. Phase 2 includes building a travel eating protocol."
        },
        {
          color: "orange",
          title: "Carbs stack on top of each other without you noticing",
          body: "April 4: bread and eggs, then rice with gravy, then mashed kenkey. Three starchy carbs in one day. The fix: one carb source per day, smaller portion. Protein and vegetables fill the rest."
        },
        {
          color: "purple",
          title: "Your protein is better than most — but your size demands significantly more",
          body: "~80–95g per day currently. You need 155–175g at your weight and height. Add a third egg to breakfast, larger chicken portions at your second meal, sardines on travel days."
        },
        {
          color: "red",
          title: "Hunger headaches are a warning sign your meal gap is too long",
          body: "Mentioned twice. Going more than 6–7 hours without food at your activity level causes a blood sugar drop. Time your two meals so the gap never exceeds this window."
        },
        {
          color: "blue",
          title: "Water doesn't appear once in 14 days of logs",
          body: "Not a single mention across 14 days. For a man of your size, minimum daily intake is 3–4 litres. Mild dehydration causes exactly the headaches you described. This is a free and immediate win."
        }
      ],
      experiments: [
        {
          label: "Exp A",
          color: "teal",
          title: "Build a travel eating protocol",
          body: "Before your next long journey: 3 boiled eggs, a handful of peanuts, a bottle of water. Log it as Meal 1 at your normal time even on a bus. The goal is to keep your two-meal structure intact on travel days."
        },
        {
          label: "Exp B",
          color: "purple",
          title: "One carb source per day",
          body: "For 7 days, allow yourself one starchy carb — rice, yam, plantain, bread or kenkey. Choose the one you want most that day. Protein and vegetables fill the rest of both meals."
        },
        {
          label: "Exp C",
          color: "amber",
          title: "Give your second meal a formula",
          body: "Your breakfast has a formula and never changes. For 7 days, give your second meal one too: protein (chicken or fish) + one carb (smaller) + vegetables. Log whether a formula makes it easier."
        }
      ],
      missing_data_improvements: [
        "Daily or weekly weight — the single most important missing data point",
        "Water intake — log it daily starting with 2.5 litres as a target",
        "Meal quantities — '250g of rice' tells us far more than 'a bowl of rice'",
        "How you felt after meals — energy levels, fullness, cravings 2 hours later",
        "Sleep quality — you logged bedtimes but not how rested you felt",
        "Travel day planning — log what you intend to eat before you travel"
      ],
      closing: "Most people trying to change their eating don't have a consistent breakfast, don't log every day, and don't have a clear structure. You have all three already. Phase 2 is not starting from scratch — it's taking what already works and extending it to the rest of your day. The foundation is solid. Now we build on it.",
      disclaimer: "This is an observational report based on food logs recorded during a 14-day self-reporting period. It is not a medical report or clinical assessment. All figures are approximations based on self-reported data — they are guides, not guarantees. Upcarva is a nutrition coaching and behaviour change programme, not a medical service."
    }
  }
}

export default function Report() {
  const navigate = useNavigate()
  const { insights } = useInsights()
  const { profile, phase2_unlocked } = useData()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBottomBar, setShowBottomBar] = useState(false)

 // const day14 = insights.find((i) => i.content?.level === "day14")
 let day14 = null

if (SIMULATION_MODE === "day14") {
  day14 = MOCK_INSIGHTS.day14
} else {
  day14 = insights.find((i) => i.content?.level === "day14")
}

  useEffect(() => {
    const handleScroll = (e) => {
      if (!e.target || !e.target.scrollHeight) return

      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0

      setScrollProgress(progress)
      setShowBottomBar(progress > 60)
    }

    const scrollElement = document.querySelector("[data-report-scroll]")
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true })
      return () => scrollElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  if (!day14) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f6fa]">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <p className="mb-2 text-[11px] text-gray-400">Your report is being prepared.</p>
            <button
              onClick={() => navigate("/")}
              className="text-[11px] text-slate-400 underline"
            >
              Back home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const content = day14.content
  const profile_data = content.profile
  const body_comp = content.body_composition
  const scores = content.scores
  const patterns = content.patterns || []
  const experiments = content.experiments || []
  const missing = content.missing_data_improvements || []

  const colorMap = {
    teal: "#0eb89a",
    amber: "#f59e0b",
    orange: "#f97316",
    purple: "#7c5cbf",
    red: "#ef4444",
    blue: "#3b82f6"
  }

  const ScoreRing = ({ label, value, color }) => {
    const circumference = 2 * Math.PI * 45
    const offset = circumference - (value / 100) * circumference

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-24 w-24">
          <svg
            className="absolute inset-0"
            viewBox="0 0 120 120"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={colorMap[color]}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-[#1a1a2e]">{value}</span>
            <span className="text-[8px] text-gray-400">%</span>
          </div>
        </div>
        <p className="text-center text-[10px] font-medium text-gray-600">{label}</p>
        <p className="text-center text-[9px] text-gray-400">{scores[label.split(" ")[0].toLowerCase()]?.note}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fa]">
      {/* Sticky Nav */}
      <div className="sticky top-0 z-40 border-b border-slate-200/50 bg-white px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-black tracking-tight"
            style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            upcarva
          </span>
          <span className="text-[10px] text-gray-400">Phase 1 · Report</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto"
        data-report-scroll
      >
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1a1a2e] px-4 py-8 text-white"
        >
          <h1
            className="mb-1 text-center text-[28px] font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {profile_data.name}'s Pattern Report
          </h1>
          <p className="mb-4 text-center text-[11px] text-gray-300">{profile_data.period}</p>

          {/* 4-stat row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { label: "Age", value: profile_data.age },
              { label: "Height", value: profile_data.height },
              { label: "Est. Weight", value: profile_data.est_weight },
              { label: "Goal", value: profile_data.goal }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/10 p-2 text-center">
                <p className="text-[9px] text-gray-300">{stat.label}</p>
                <p className="text-[11px] font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* BODY COMPOSITION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto max-w-sm space-y-4 px-4 py-6"
        >
          <h2
            className="text-[16px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Where You Stand
          </h2>

          <div className="space-y-2">
            <table className="w-full text-[10px]">
              <tbody className="space-y-1">
                {[
                  ["Body Fat %", body_comp.body_fat_pct, body_comp.body_fat_plain],
                  ["Fat Mass", body_comp.fat_mass, body_comp.fat_mass_plain],
                  ["Lean Mass", body_comp.lean_mass, body_comp.lean_mass_plain],
                  ["Fat to Lose", body_comp.fat_to_lose, body_comp.fat_to_lose_plain],
                  ["Timeline", body_comp.timeline, body_comp.timeline_plain]
                ].map(([metric, estimate, plain]) => (
                  <tr key={metric} className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700">{metric}</td>
                    <td className="py-2 text-gray-400">{estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Missing data callout */}
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3">
            <p className="text-[10px] text-amber-900">{body_comp.missing_data_callout}</p>
          </div>
        </motion.div>

        {/* SCORES */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto max-w-sm space-y-4 px-4 py-6"
        >
          <h2
            className="text-[16px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Phase 1 Scores
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <ScoreRing label="Logging" value={scores.logging.value} color={scores.logging.color} />
            <ScoreRing label="Detail" value={scores.detail.value} color={scores.detail.color} />
            <ScoreRing label="Timing" value={scores.timing.value} color={scores.timing.color} />
            <ScoreRing label="Nutrition" value={scores.nutrition.value} color={scores.nutrition.color} />
          </div>
        </motion.div>

        {/* MACROS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto max-w-sm space-y-4 px-4 py-6"
        >
          <h2
            className="text-[16px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What You're Actually Eating
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Current", data: content.macros_current },
              { title: "Target", data: content.macros_target }
            ].map(({ title, data }) => (
              <div key={title} className="space-y-2 rounded-lg bg-white p-3">
                <p className="text-[10px] font-semibold text-gray-600">{title}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500">Carbs</span>
                    <span className="text-[10px] font-bold text-gray-700">{data.carbs}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500">Protein</span>
                    <span className="text-[10px] font-bold text-gray-700">{data.protein}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500">Fat</span>
                    <span className="text-[10px] font-bold text-gray-700">{data.fat}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-teal-50 p-3 text-[10px] text-teal-900">{content.macro_highlight}</div>
        </motion.div>

        {/* PATTERNS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto max-w-sm space-y-3 px-4 py-6"
        >
          <h2
            className="text-[16px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your Patterns
          </h2>

          {patterns.map((pattern, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.05 }}
              className="rounded-lg border-l-4 bg-white p-3"
              style={{ borderLeftColor: colorMap[pattern.color] }}
            >
              <p className="mb-1 text-[11px] font-bold text-gray-800">{pattern.title}</p>
              <p className="text-[10px] text-gray-600">{pattern.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* EXPERIMENTS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mx-auto max-w-sm space-y-3 px-4 py-6"
        >
          <h2
            className="text-[16px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your Phase 2 Experiments
          </h2>

          {experiments.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + idx * 0.05 }}
              className="overflow-hidden rounded-lg bg-white"
            >
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ backgroundColor: colorMap[exp.color] }}
              >
                <span className="text-sm">🧪</span>
                <span className="text-[9px] font-bold uppercase text-white">{exp.label}</span>
                <span className="text-[11px] font-semibold text-white">{exp.title}</span>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-gray-700">{exp.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* MISSING DATA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mx-auto max-w-sm space-y-3 px-4 py-6"
        >
          <h2
            className="text-[16px] font-bold text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What Would Make Your Next Report Better
          </h2>

          <div className="space-y-2">
            {missing.map((item, idx) => (
              <div key={idx} className="flex gap-2 text-[10px] text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CLOSING */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mx-auto max-w-sm px-4 py-6"
        >
          <div className="border-l-4 border-teal-500 bg-[#1a1a2e] p-4 text-[10px] text-gray-200">
            {content.closing}
          </div>
        </motion.div>

        {/* DISCLAIMER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mx-auto max-w-sm space-y-3 px-4 py-6 pb-32"
        >
          <div className="rounded-lg bg-white p-3 text-[9px] text-gray-500">
            {content.disclaimer}
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Bar */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: showBottomBar ? 0 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed bottom-16 left-0 right-0 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-lg"
        style={{ width: "calc(100% - 32px)" }}
      >
        <p className="mb-1 text-[10px] text-gray-400">What's next</p>
        <p className="mb-3 text-[14px] font-bold text-[#1a1a2e]">Now we can start changing it.</p>
        <motion.button
          onClick={() => navigate(phase2_unlocked ? "/calibration" : "/paywall")}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-teal-500 py-3 text-[13px] font-bold text-white"
        >
          Begin Phase 2 →
        </motion.button>
      </motion.div>
    </div>
  )
}
