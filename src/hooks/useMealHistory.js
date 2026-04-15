import { useData } from "../contexts/DataContext"

export function useMealHistory() {
  const { groupedMeals } = useData()
  return { grouped: groupedMeals }
}