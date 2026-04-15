import { useMemo } from "react"
import { useData } from "../contexts/DataContext"

export function useTodayMeals() {
  const { meals } = useData()
  const today = new Date().toISOString().split("T")[0]

  const todayMeals = useMemo(() => {
    return meals.filter(meal => meal.log_date === today).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [meals, today])

  const hasLoggedToday = todayMeals.length > 0

  return { meals: todayMeals, hasLoggedToday }
}