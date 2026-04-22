import { motion } from "framer-motion"

export default function StreakCard({ streak, hasLoggedToday, isStreakAtRisk, logs, className = "" }) {
  let state
  if (streak === 0) {
    state = "none"
  } else if (isStreakAtRisk) {
    state = "risk"
  } else if (hasLoggedToday) {
    state = "logged"
  } else {
    state = "alive"
  }

  const cardClasses = {
    none: "bg-white/80 border-white/70",
    alive: "bg-orange-50/90 border-orange-200/80",
    logged: "bg-green-50/95 border-green-200/80",
    risk: "bg-red-50/95 border-red-200/80"
  }

  const numberClasses = {
    none: "text-slate-300",
    alive: "text-orange-500",
    logged: "text-green-500",
    risk: "text-red-500"
  }

  const glowClasses = {
    none: "bg-transparent",
    alive: "bg-orange-400",
    logged: "bg-green-400",
    risk: "bg-red-400"
  }

  const subLabelClasses = {
    none: "text-slate-400",
    alive: "text-orange-500/80",
    logged: "text-green-500/80",
    risk: "text-red-500/80"
  }

  const renderIcon = () => {
    if (state === "none") return null
    if (state === "alive") return (
      <motion.span 
        animate={{ y: [0, -6, 0] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-3xl"
      >
        🔥
      </motion.span>
    )
    if (state === "logged") {
      return (
        <motion.div 
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-300/70 bg-green-100/95 shadow-[0_10px_30px_rgba(34,197,94,0.18)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="h-5 w-5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )
    }
    return (
      <motion.span
        animate={{ rotate: [0, -8, 8, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
        className="text-3xl"
      >
        ⚠️
      </motion.span>
    )
  }

  const renderLabel = () => {
    if (state === "none") return "start your streak today"
    if (state === "alive") return "day streak - keep it alive"
    if (state === "logged") return "day streak - you showed up!"
    return "streak at risk - log now"
  }

  const renderDots = () => {
    const dots = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const isToday = i === 0
      const logged = logs.includes(dateStr)

      let dotClass = "h-2.5 w-2.5 rounded-sm "
      if (isToday && logged) dotClass += "bg-green-500"
      else if (isToday && !logged) dotClass += "bg-red-300"
      else if (!isToday && logged) dotClass += "bg-orange-400"
      else dotClass += "bg-slate-200"

      dots.push(
        <motion.div 
          key={i} 
          className={dotClass}
          whileHover={{ scale: 1.35, rotateZ: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
      )
    }

    return dots
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[24px] border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm ${cardClasses[state]} ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          {renderIcon()}
        </div>
        <div className="relative mb-1 flex justify-center">
          {state !== "none" && (
            <motion.div 
              className={`absolute top-1/2 h-16 w-16 -translate-y-1/2 rounded-full blur-2xl opacity-20 ${glowClasses[state]}`}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.div 
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
            className={`relative text-5xl font-black tracking-tight ${numberClasses[state]}`}
          >
            {streak}
          </motion.div>
        </div>
        <p className={`text-[10px] tracking-wide font-medium ${subLabelClasses[state]}`}>
          {renderLabel()}
        </p>
        <div className="mt-2.5 flex justify-center gap-1.5">
          {renderDots()}
        </div>
      </div>
    </motion.div>
  )
}
