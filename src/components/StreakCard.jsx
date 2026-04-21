export default function StreakCard({ streak, hasLoggedToday, isStreakAtRisk, logs, className = "" }) {
  const today = new Date().toISOString().split("T")[0]

  // Determine state
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

  // Card styles
  const cardClasses = {
    none: "bg-gray-50 border border-gray-200",
    alive: "bg-orange-50 border border-orange-200",
    logged: "bg-green-50 border border-green-200",
    risk: "bg-red-50 border border-red-200"
  }

  // Icon
  const renderIcon = () => {
    if (state === "none") return null
    if (state === "alive") return <span className="text-2xl">🔥</span>
    if (state === "logged") return (
      <div className="w-11 h-11 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="w-5 h-5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
    if (state === "risk") return <span className="text-2xl">⚠️</span>
  }

  // Streak number styles
  const numberClasses = {
    none: "text-4xl font-bold text-gray-400",
    alive: "text-4xl font-bold text-orange-600",
    logged: "text-4xl font-bold text-green-600",
    risk: "text-4xl font-bold text-red-600"
  }

  // Label
  const renderLabel = () => {
    if (state === "none") return "start your streak today"
    if (state === "alive") return "day streak — keep it alive"
    if (state === "logged") return "day streak — you showed up!"
    if (state === "risk") return "streak at risk — log now"
  }

  // Dots
  const renderDots = () => {
    const dots = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const isToday = i === 0
      const logged = logs.includes(dateStr)

      let dotClass = "w-2.5 h-2.5 rounded-sm "
      if (isToday && logged) dotClass += "bg-green-500"
      else if (isToday && !logged) dotClass += "bg-red-300"
      else if (!isToday && logged) dotClass += "bg-orange-400"
      else dotClass += "bg-gray-200"

      dots.push(<div key={i} className={dotClass}></div>)
    }
    return dots
  }

  return (
    <div className={`rounded-xl p-6 ${cardClasses[state]} ${className}`}>
      <div className="text-center">
        <div className="mb-2">
          {renderIcon()}
        </div>
        <div className={`mb-1 ${numberClasses[state]}`}>
          {streak}
        </div>
        <div className={`text-xs ${state === "none" ? "text-gray-400" : state === "alive" ? "text-orange-700" : state === "logged" ? "text-green-700" : "text-red-700"}`}>
          {renderLabel()}
        </div>
        <div className="flex justify-center gap-1 mt-2">
          {renderDots()}
        </div>
      </div>
    </div>
  )
}