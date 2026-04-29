import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useInsights } from "../hooks/useInsights"
import { useData } from "../contexts/DataContext"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"

export default function Calibration() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { insights, markAsRead } = useInsights()
  const { profile, phase2_unlocked } = useData()
  const [loading, setLoading] = useState(false)

  const cal1 = insights.find((i) => i.content?.level === "calibration_day1")

  // Redirect if phase2 not unlocked
  useEffect(() => {
    if (!phase2_unlocked) {
      navigate("/report")
    }
  }, [phase2_unlocked, navigate])

  // Mark as read
  useEffect(() => {
    if (cal1 && !cal1.is_read) {
      markAsRead(cal1.id)
    }
  }, [cal1, markAsRead])

  if (!cal1) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f6fa]">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <p className="mb-2 text-[11px] text-gray-400">Loading your calibration...</p>
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

  const content = cal1.content

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6fa] pb-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#1a1a2e] px-4 py-8 text-white"
      >
        <div className="mb-4 inline-block rounded-full bg-teal-500/20 px-3 py-1 text-[10px] font-bold uppercase text-teal-600">
          Phase 2 · Calibration · Day 1
        </div>
        <h1
          className="mb-2 text-[24px] font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Calibration begins.
        </h1>
        <p className="text-[12px] text-gray-300">Welcome back, {profile?.name}. Here's where we start.</p>
      </motion.div>

      {/* Body */}
      <div className="mx-auto max-w-sm space-y-4 px-4 py-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border-l-4 border-teal-500 bg-white p-4"
        >
          <h2 className="mb-2 text-[13px] font-bold text-[#1a1a2e]">{content.welcome_title}</h2>
          <p className="text-[11px] text-gray-700 leading-relaxed">
            {content.welcome_body.split("we're not touching that")[0]}
            <span className="font-bold">we're not touching that</span>
            {content.welcome_body.split("we're not touching that")[1]}
          </p>
        </motion.div>

        {/* Experiment Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-xl bg-white shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-2 bg-[#1a1a2e] px-4 py-3">
            <span className="text-lg">🧠</span>
            <div>
              <p className="text-[9px] font-bold uppercase text-teal-400">{content.experiment_label}</p>
              <p className="text-[12px] font-semibold text-white">{content.experiment_title}</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-3 p-4">
            <p className="text-[11px] text-gray-700 leading-relaxed">
              {content.experiment_body.split("pause for a moment before acting")[0]}
              <span className="font-bold">pause for a moment before acting</span>
              {content.experiment_body.split("pause for a moment before acting")[1]}
            </p>

            {/* Note Box */}
            <div className="rounded-lg bg-[#f8f9fb] p-3">
              <p className="text-[10px] italic text-gray-500">{content.experiment_note}</p>
            </div>
          </div>
        </motion.div>

        {/* Log CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-teal-500 py-3 text-[13px] font-bold text-white"
        >
          Log today's first meal →
        </motion.button>
      </div>
    </div>
  )
}
