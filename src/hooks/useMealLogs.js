import { useData } from "../contexts/DataContext"

export function useMealLogs() {
  const { logs, streak, challengeDays } = useData()
  return { logs, streak, challengeDays }
}