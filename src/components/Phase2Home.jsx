import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import Toast from "./Toast"
import { useData } from "../contexts/DataContext"
import { useMealLogs } from "../hooks/useMealLogs"
import { usePhase2Moves } from "../hooks/usePhase2Moves"
import { useTodayMeals } from "../hooks/useTodayMeals"
import { supabase } from "../lib/supabase"

const serifStyle = { fontFamily: "'Instrument Serif', serif" }

function MoveCard({ move, acknowledged, onGotIt, onSwap }) {
  const initialMount = useRef(true)
  const shouldAnimate = !(initialMount.current && acknowledged)

  useEffect(() => {
    initialMount.current = false
  }, [])

  return (
    <motion.section
      layout
      initial={shouldAnimate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
      className={`relative overflow-hidden rounded-[20px] bg-[#111118] shadow-[0_18px_48px_rgba(15,23,42,0.16)] ${
        acknowledged ? "p-3" : "p-4"
      }`}
    >
      <div className="pointer-events-none absolute right-[-34px] top-[-34px] h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle,rgba(124,92,191,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-30px] left-4 h-[90px] w-[90px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.16),transparent_70%)]" />

      <p className="relative text-right text-[8px] font-bold uppercase tracking-[0.12em] text-[#0db89a]">Today's move</p>
      {move.caption ? (
        <p className="relative mt-1 text-[10px] font-semibold tracking-[0.04em] text-[#7c6cff]">
          {move.caption}
        </p>
      ) : null}
      <h2
        className={`relative leading-snug tracking-[-0.2px] text-white ${
          acknowledged ? "mt-1 text-[15px]" : "mt-2 text-[19px]"
        }`}
        style={serifStyle}
      >
        {move.title}
      </h2>
      <AnimatePresence>
        {!acknowledged && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="relative mt-1 text-[10px] italic leading-relaxed text-white/40">{move.subtext}</p>

            <div className="relative mt-4 grid grid-cols-[1fr_auto] gap-2">
              <motion.button
                onClick={onGotIt}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl bg-[#0db89a] px-4 py-2.5 text-[12px] font-bold text-[#111118]"
              >
                I Got this!
              </motion.button>
              <motion.button
                onClick={onSwap}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-600"
              >
                Swap
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {acknowledged && (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative mt-1.5 text-[10px] font-medium text-[#0db89a]"
          >
            Locked in for today 💪
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function CelebrationSheet({ status, move, weekCompleted, isFirstEverCompletion, onClose }) {
  const configs = {
    did_it: {
      icon: null,
      bg: "linear-gradient(160deg, #0a1a14 0%, #111118 100%)",
      headline: isFirstEverCompletion ? "You did it" : "You did it again!",
      sub: isFirstEverCompletion
        ? "You completed your first move, this is how real change begins"
        : "This is how small changes start becoming patterns.",
      accentColor: "#0db89a",
      ctaLabel: "See today's moves ->",
      showRing: true
    },
    partly: {
      icon: "⚡",
      bg: "linear-gradient(160deg, #1a1000 0%, #111118 100%)",
      headline: "You tried.\nThat counts.",
      sub: "Showing up halfway is still showing up.",
      accentColor: "#f59e0b",
      cardBg: "rgba(245,158,11,0.1)",
      cardBorder: "rgba(245,158,11,0.2)",
      cardText:
        "You were amazing for trying. Partial effort is how full effort starts. Let's go after it again tomorrow - you're closer than you think.",
      ctaLabel: "See today's moves ->",
      showRing: false
    },
    not_today: {
      icon: "💜",
      bg: "linear-gradient(160deg, #0f0a18 0%, #111118 100%)",
      headline: "You still showed up.",
      sub: "Not every day is a win day.\nComing back is what matters.",
      accentColor: "#a78bfa",
      cardBg: "rgba(124,92,191,0.12)",
      cardBorder: "rgba(124,92,191,0.2)",
      cardText:
        "You opened the app. You checked in. That's not nothing - that's the habit. The move comes back tomorrow, no judgment.",
      ctaLabel: "See today's moves ->",
      showRing: false
    }
  }

  const cfg = configs[status]
  const [ringFull, setRingFull] = useState(false)
  const [checkIn, setCheckIn] = useState(false)
  const circumference = 2 * Math.PI * 35

  useEffect(() => {
    if (status === "did_it") {
      const t1 = window.setTimeout(() => setRingFull(true), 220)
      const t2 = window.setTimeout(() => setCheckIn(true), 980)
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
    }
  }, [status])

  if (!cfg) return null

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-[3px]"
      style={{ background: "rgba(10,10,18,0.52)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="flex flex-col items-center rounded-[26px] border border-white/10 px-6 py-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
        style={{ background: cfg.bg }}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.96 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        {cfg.showRing && (
          <div className="relative mb-3 h-20 w-20">
            <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(13,184,154,0.15)" strokeWidth="5" />
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#0db89a"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                animate={{ strokeDashoffset: ringFull ? 0 : circumference }}
                transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-[26px] text-white"
              initial={{ scale: 0.2, opacity: 0, y: -22, rotate: -10 }}
              animate={
                checkIn
                  ? { scale: [0.2, 1.62, 0.88, 1.18, 1], opacity: 1, y: [-22, 12, -4, 1, 0], rotate: [-10, 8, -4, 1, 0] }
                  : { scale: 0.2, opacity: 0 }
              }
              transition={{ duration: 1.05, times: [0, 0.42, 0.68, 0.86, 1], ease: "easeOut" }}
            >
              ✓
            </motion.div>
          </div>
        )}

        {cfg.icon && (
          <motion.div
            className="mb-3 text-[40px]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
          >
            {cfg.icon}
          </motion.div>
        )}

        <motion.h2
          className="mb-2 text-[22px] leading-tight text-white"
          style={serifStyle}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: status === "did_it" ? 0.3 : 0.2, duration: 0.35 }}
        >
          {cfg.headline.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && cfg.headline.includes("\n") && <br />}
            </span>
          ))}
        </motion.h2>

        <motion.p
          className="mb-4 text-[11px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.45)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: status === "did_it" ? 0.45 : 0.35, duration: 0.35 }}
        >
          {cfg.sub.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && cfg.sub.includes("\n") && <br />}
            </span>
          ))}
        </motion.p>

        {status === "did_it" && !isFirstEverCompletion && (
          <motion.div
            className="mb-4 flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <span className="text-sm">⚡</span>
            <span className="text-[16px] font-bold text-white">{weekCompleted}</span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              moves this week
            </span>
          </motion.div>
        )}

        {status === "partly" && (
          <motion.div
            className="mb-4 h-1.5 w-40 overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#f59e0b" }}
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </motion.div>
        )}

        {status === "not_today" && (
          <motion.div
            className="mb-4 rounded-full px-4 py-2 text-[10px]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Tomorrow's move resets fresh for you.
          </motion.div>
        )}

        {cfg.cardText && (
          <motion.div
            className="mb-5 max-w-xs rounded-xl px-4 py-3"
            style={{ background: cfg.cardBg, border: `1px solid ${cfg.cardBorder}` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: status === "partly" ? 0.55 : 0.35 }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {cfg.cardText}
            </p>
          </motion.div>
        )}

        <motion.button
          onClick={onClose}
          className="rounded-xl px-8 py-3 text-[12px] font-bold"
          style={{ background: "white", color: "#111118", border: "none", cursor: "pointer" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: status === "did_it" ? 0.75 : 0.65 }}
          whileTap={{ scale: 0.97 }}
        >
          {cfg.ctaLabel}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function FeedbackPopup({ attempt, weekCompleted, totalCompletedBase, onSubmit, onSkip }) {
  const title = attempt?.title || "Your move from yesterday."
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [partlyReason, setPartlyReason] = useState("")
  const [celebrationStatus, setCelebrationStatus] = useState(null)
  const [isFirstEverCompletion, setIsFirstEverCompletion] = useState(false)

  const handleResponse = (status) => {
    setSelectedStatus(status)

    if (status !== "partly") {
      window.setTimeout(async () => {
        const ok = await onSubmit(status)
        if (ok) {
          setIsFirstEverCompletion(status === "did_it" && totalCompletedBase === 0)
          setCelebrationStatus(status)
        }
      }, 240)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end bg-[#111118]/65 px-4 pb-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="mx-auto w-full max-w-sm rounded-[24px] bg-white px-5 pb-5 pt-[22px] shadow-[0_-4px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="mx-auto mb-[18px] h-[3px] w-8 rounded bg-[#e5e5e5]" />
        <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#0db89a]">Quick check-in</p>
        <h2 className="text-[20px] leading-tight text-[#111118]" style={serifStyle}>
          How did yesterday's move go?
        </h2>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f2f1ee] px-[13px] py-[11px]">
          <span className="text-[15px]">💡</span>
          <p className="text-[12px] font-medium leading-snug text-[#2a2a38]">{title}</p>
        </div>

        <div className="mt-3 grid gap-2">
          {[
            ["did_it", "✅", "Did it"],
            ["partly", "⚡", "Partly"],
            ["not_today", "😅", "Not today"]
          ].map(([status, emoji, label]) => (
            <motion.button
              key={status}
              onClick={() => handleResponse(status)}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center gap-2.5 rounded-[13px] border-[1.5px] px-4 py-[13px] text-left text-[13px] font-medium transition ${
                selectedStatus === status
                  ? status === "did_it"
                    ? "border-[#0db89a] bg-[#f0fdf9] text-[#4a9d7a]"
                    : status === "partly"
                      ? "border-[#f59e0b] bg-[#fffbf0] text-[#92400e]"
                      : "border-[#fb923c] bg-[#fff7f0] text-[#9a3412]"
                  : "border-[#e8e6e1] bg-white text-[#111118] hover:border-[#7c5cbf] hover:bg-[#faf8ff]"
              }`}
            >
              <span className="text-[17px]">{emoji}</span>
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedStatus === "partly" && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mt-3 overflow-hidden"
            >
              <label className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.10em] text-[#8a8a9a]">
                Tiny note, optional
              </label>
              <textarea
                value={partlyReason}
                onChange={(event) => setPartlyReason(event.target.value)}
                placeholder="What made it partly? This helps tomorrow."
                className="h-[62px] w-full resize-none rounded-xl border-[1.5px] border-[#e8e6e1] bg-[#faf9f6] px-3 py-2.5 text-[12px] text-[#111118] outline-none transition focus:border-[#f59e0b]/50"
              />
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <button
                  onClick={async () => {
                    const ok = await onSubmit("partly", partlyReason.trim() || null)
                    if (ok) {
                      setIsFirstEverCompletion(false)
                      setCelebrationStatus("partly")
                    }
                  }}
                  className="rounded-xl bg-[#f59e0b] px-4 py-2.5 text-[12px] font-bold text-white"
                >
                  Save response
                </button>
                <button
                  onClick={async () => {
                    const ok = await onSubmit("partly")
                    if (ok) {
                      setIsFirstEverCompletion(false)
                      setCelebrationStatus("partly")
                    }
                  }}
                  className="rounded-xl border border-[#e8e6e1] px-3 py-2.5 text-[12px] font-semibold text-[#8a8a9a]"
                >
                  Skip note
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-4 text-center text-[9px] italic text-[#8a8a9a]">
          Your answer helps personalize tomorrow.
        </p>
      </motion.div>

      <AnimatePresence>
        {celebrationStatus && (
          <CelebrationSheet
            status={celebrationStatus}
            move={attempt}
            weekCompleted={weekCompleted}
            isFirstEverCompletion={isFirstEverCompletion}
            onClose={() => {
              setCelebrationStatus(null)
              setIsFirstEverCompletion(false)
              onSkip()
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LogMealSheet({ show, onClose, onSaved }) {
  const { silentRefetch } = useData()
  const { meals } = useTodayMeals()
  const { streak } = useMealLogs()
  const [text, setText] = useState("")
  const [hungerLevel, setHungerLevel] = useState(null)
  const [triggerType, setTriggerType] = useState(null)
  const [cost, setCost] = useState("")
  const [mealTime, setMealTime] = useState("")
  const [saving, setSaving] = useState(false)

  const canSave = text.trim() && hungerLevel !== null && triggerType

  useEffect(() => {
    if (hungerLevel === 3 && !triggerType) setTriggerType("hunger")
  }, [hungerLevel, triggerType])

  const reset = () => {
    setText("")
    setHungerLevel(null)
    setTriggerType(null)
    setCost("")
    setMealTime("")
  }

  const saveMeal = async () => {
    if (!canSave || saving) return
    setSaving(true)

    const { data } = await supabase.auth.getUser()
    const user = data?.user

    if (!user) {
      setSaving(false)
      return
    }

    const today = new Date().toISOString().split("T")[0]
    const eatenAt = mealTime ? `${today}T${mealTime}:00Z` : new Date().toISOString()

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

    setSaving(false)

    if (error) {
      console.error(error)
      return
    }

    reset()
    silentRefetch()
    const newMealCount = meals.length + 1
    if (newMealCount === 1) {
      onSaved(`Day ${streak + 1} started 🔥`)
    } else if (newMealCount === 2) {
      onSaved("💪 Keep the momentum!")
    } else if (newMealCount === 3) {
      onSaved("🚀 You're on fire!")
    } else {
      onSaved("Logged ✅")
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/28 px-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Log meal</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800">Nice. Let's log it.</h2>
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
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Food & Quantity e.g. about half plate of rice..."
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
                  onChange={(event) => setCost(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-800 outline-none transition focus:border-[#7c6cff]/40 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
                  Time eaten (in case you want to log a past meal)
                </label>
                <input
                  type="time"
                  value={mealTime}
                  onChange={(event) => setMealTime(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-700 outline-none focus:border-[#7c6cff]/40 focus:bg-white"
                />
                <p className="mt-1 text-[9px] text-slate-400">Leave blank to use current time</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <motion.button
                onClick={saveMeal}
                disabled={!canSave || saving}
                whileTap={{ scale: 0.98 }}
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
  )
}

export default function Phase2Home() {
  const { profile } = useData()
  const { meals } = useTodayMeals()
  const { streak } = useMealLogs()
  const [showLogSheet, setShowLogSheet] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [feedbackSessionOpen, setFeedbackSessionOpen] = useState(false)

  const {
    loading,
    phase2Day,
    selectedMove,
    todayAttempt,
    yesterdayAttempt,
    shouldAskYesterday,
    weekSummary,
    completedSummary,
    acceptTodayMove,
    submitFeedback,
    swapMove,
    seedDemoYesterday,
    skipFeedback
  } = usePhase2Moves({ userId: profile?.auth_id, enabled: true })
  const demoControls = import.meta.env.DEV
  const momentumLabel = streak >= 7 ? "Strong" : streak >= 3 ? "building fast" : "Building"
  const firstName = profile?.name?.trim()?.split(" ")[0] || ""
  const momentumMessage = `you are ${momentumLabel}!`
  const winsUntilClick = Math.max(2, 4 - weekSummary.completed)
  const winCopy = winsUntilClick === 2 ? "2-3" : winsUntilClick

  useEffect(() => {
    if (!toastVisible) return
    const timeout = window.setTimeout(() => setToastVisible(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [toastVisible])

  const showToast = (message) => {
    setToastMsg(message)
    setToastVisible(true)
  }

  const isHydrated = !loading

  useEffect(() => {
    if (isHydrated && shouldAskYesterday) {
      setFeedbackSessionOpen(true)
    }
  }, [isHydrated, shouldAskYesterday])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] px-4 pb-24 py-5">
      <Toast message={toastMsg} visible={toastVisible} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#7c6cff]/12 blur-3xl" />
        <div className="absolute bottom-10 right-[-40px] h-[180px] w-[180px] rounded-full bg-[#ff8a3d]/12 blur-3xl" />
      </div>

      <div
        className={`relative mx-auto max-w-sm space-y-4 transition-opacity duration-150 ${
          isHydrated && shouldAskYesterday ? "opacity-60" : "opacity-100"
        }`}
      >
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="rounded-[24px] border border-white/80 bg-white/75 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="text-lg font-black tracking-tight"
                style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                upcarva
              </span>
              <div className="mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Calibration
                </p>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
                  className="mt-1 text-[11px] leading-relaxed text-slate-500"
                >
                  {firstName ? `${firstName}, you're ` : "You're "}
                  <span
                    className="font-semibold"
                    style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    building momentum
                  </span>{" "}
                  <motion.span
                    animate={{ scale: [1, 1.16, 1], rotate: [0, 8, -5, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.1, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    ⚡
                  </motion.span>
                </motion.p>
                {/* <h1 className="mt-1 text-[24px] font-semibold leading-none tracking-[-0.2px] text-slate-800">
                  Day {phase2Day}
                </h1> */}
              </div>
              {/* <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                {winCopy} more wins and things will start to click
              </p> */}
            </div>
            <div className="flex w-[118px] flex-col items-end gap-1.5">
                  {/* <div className="flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-white px-2.5 py-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.07)]">
                    <span className="text-[9px] text-[#8a8a9a]">2 moves completed </span>
                <span className="text-[9px] text-[#8a8a9a]">{momentumLabel}</span>
                    <motion.span
                      animate={{ scale: [1, 1.18, 1], rotate: [0, 6, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
                      className="text-[12px] leading-none"
                    >
                      ⚡
                    </motion.span>
                </div> */}
                <div className="flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-white px-2.5 py-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.07)]">
  
                <span className="whitespace-nowrap text-[9px] text-[#8a8a9a] flex items-center gap-1">
                  <motion.span
                    key={completedSummary.totalCompleted}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-[11px] font-bold text-teal-500"
                  >
                    {completedSummary.totalCompleted}
                  </motion.span>
                  <span>moves completed</span>
                </span>

                {/* <span className="text-[9px] text-[#8a8a9a]"> {momentumLabel}</span> */}

                {/* <motion.span
                  animate={{ scale: [1, 1.18, 1], rotate: [0, 6, -4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
                  className="text-[12px] leading-none"
                >
                  ⚡
                </motion.span> */}

              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-white px-2.5 py-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.07)]">
                <span className="text-sm font-bold leading-none text-[#111118]">{streak}</span>
                <span className="text-[9px] text-[#8a8a9a]">day streak</span>
                <motion.span
                  animate={{ scale: [1, 1.16, 1], rotate: [0, -5, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
                  className="text-[12px] leading-none"
                >
                  🔥
                </motion.span>
              </div>
              {/* <p className="mt-1 text-right text-[9px] font-semibold leading-tight text-slate-500">
                {weekSummary.completed} {weekSummary.completed === 1 ? "move" : "moves"} this week
              </p> */}
              {/* <div className="grid w-full grid-cols-7 gap-0.5">
                {Array.from({ length: 7 }).map((_, index) => {
                  const day = weekSummary.days[index]
                  const status = day?.completion_status
                  const color =
                    status === "did_it"
                      ? "bg-[#0db89a]"
                      : status === "partly"
                        ? "bg-[#f59e0b]"
                        : "bg-slate-200"

                  return <span key={index} className={`h-2 rounded-[2px] ${color}`} />
                })}
              </div> */}
            </div>
          </div>
        </motion.header>

        {selectedMove ? (
          <MoveCard
            move={selectedMove}
            acknowledged={!!todayAttempt || selectedMove?.status === "active"}
            onGotIt={() => {
              acceptTodayMove()
              showToast("Move saved for today.")
            }}
            onSwap={() => {
              swapMove()
            }}
          />
        ) : (
          <section className="relative overflow-hidden rounded-[20px] bg-[#111118] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
            <div className="pointer-events-none absolute right-[-34px] top-[-34px] h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle,rgba(124,92,191,0.22),transparent_70%)]" />
            <div className="pointer-events-none absolute bottom-[-30px] left-4 h-[90px] w-[90px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.16),transparent_70%)]" />
            <p className="relative text-right text-[8px] font-bold uppercase tracking-[0.12em] text-[#0db89a]">Today's move</p>
            {selectedMove?.caption ? (
              <p className="relative mt-1 text-[10px] font-semibold tracking-[0.04em] text-[#7c6cff]">
                {selectedMove.caption}
              </p>
            ) : null}
            <p className="relative mt-2 text-[16px] leading-snug text-white" style={serifStyle}>
              Oops.. seems no moves available yet
            </p>
          </section>
        )}

        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.26, ease: "easeOut", delay: 0.08 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowLogSheet(true)}
          className="w-full rounded-xl py-3 text-[12px] font-bold text-white shadow-[0_14px_28px_rgba(91,103,255,0.24)] transition-transform active:scale-[0.94]"
          style={{ background: "var(--grad)" }}
        >
          Log Meal
        </motion.button>

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

        {demoControls && (
          <button
            onClick={seedDemoYesterday}
            className="w-full rounded-2xl border border-dashed border-slate-300 py-3 text-[11px] font-semibold text-slate-400"
          >
            Test yesterday feedback popup
          </button>
        )}

      </div>

      <AnimatePresence>
        {isHydrated && (shouldAskYesterday || feedbackSessionOpen) && (  
          <FeedbackPopup
            attempt={yesterdayAttempt}
            weekCompleted={completedSummary.weeklyCompleted}
            totalCompletedBase={completedSummary.totalCompleted}
            onSubmit={async (status, partlyReason) => {
              return await submitFeedback(status, partlyReason)
            }}
            onSkip={() => {
              skipFeedback()
              setFeedbackSessionOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      <LogMealSheet
        show={showLogSheet}
        onClose={() => setShowLogSheet(false)}
        onSaved={showToast}
      />
    </div>
  )
}
