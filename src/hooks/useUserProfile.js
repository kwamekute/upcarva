import { useData } from "../contexts/DataContext"

export function useUserProfile() {
  const { profile } = useData()
  return { profile }
}