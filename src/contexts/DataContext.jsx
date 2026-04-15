import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const DataContext = createContext()

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export function DataProvider({ children, session }) {
  const [profile, setProfile] = useState(null)
  const [meals, setMeals] = useState([])
  const [groupedMeals, setGroupedMeals] = useState({})
  const [logs, setLogs] = useState([])
  const [streak, setStreak] = useState(0)
  const [challengeDays, setChallengeDays] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchAllData = async (userId) => {
    setLoading(true)
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", userId)
        .maybeSingle()
      setProfile(profileData)

      // Fetch all meals
      const { data: mealsData, error } = await supabase
        .from("meals")
        .select("*")
        .eq("auth_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setMeals(mealsData || [])

      // Group meals by date
      const grouped = {}
      mealsData?.forEach((meal) => {
        const date = meal.log_date
        if (!grouped[date]) grouped[date] = []
        grouped[date].push({ description: meal.description, reason: meal.reason })
      })
      setGroupedMeals(grouped)

      // Calculate logs, streak, challenge days
      const uniqueDays = [...new Set(mealsData?.map(d => d.log_date) || [])].sort()
      setLogs(uniqueDays)
      setChallengeDays(uniqueDays.length)

      // Calculate streak
      calculateStreak(uniqueDays)

    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (datesArray) => {
    if (!datesArray.length) { setStreak(0); return }

    const today = new Date().toISOString().split("T")[0]
    const sorted = [...datesArray].sort().reverse()

    let count = 0
    let current = new Date(today)

    if (!sorted.includes(today)) {
      current.setDate(current.getDate() - 1)
    }

    while (true) {
      const check = current.toISOString().split("T")[0]
      if (sorted.includes(check)) {
        count++
        current.setDate(current.getDate() - 1)
      } else {
        break
      }
    }

    setStreak(count)
  }

  useEffect(() => {
    if (!session?.user) return

    fetchAllData(session.user.id)

    // Set up real-time subscriptions
    const mealsChannel = supabase
      .channel('meals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meals',
        filter: `auth_id=eq.${session.user.id}`
      }, () => {
        fetchAllData(session.user.id)
      })
      .subscribe()

    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `auth_id=eq.${session.user.id}`
      }, () => {
        fetchAllData(session.user.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(mealsChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [session?.user?.id])

  const addMealLocally = (newMeal) => {
    setMeals(prev => [newMeal, ...prev])

    // Update grouped meals
    const date = newMeal.log_date
    setGroupedMeals(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), { description: newMeal.description, reason: newMeal.reason }]
    }))

    // Update logs if new date
    setLogs(prev => {
      if (!prev.includes(date)) {
        return [...prev, date].sort()
      }
      return prev
    })

    // Recalculate streak and challenge days
    setChallengeDays(prev => prev + (logs.includes(date) ? 0 : 1))
    // For streak, we might need to recalculate fully, but for simplicity, refetch if needed
  }

  const value = {
    profile,
    meals,
    groupedMeals,
    logs,
    streak,
    challengeDays,
    loading,
    refetch: () => session?.user && fetchAllData(session.user.id),
    addMealLocally
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}