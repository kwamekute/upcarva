import { useData } from "../contexts/DataContext"

export function useMealLogs() {
  const { logs, streak, challengeDays, isStreakAtRisk } = useData()
  return { logs, streak, challengeDays, isStreakAtRisk }
}