import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./useAuth"

export function useInsights() {
  const { session } = useAuth()
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchInsights = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setInsights(data || [])
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [session?.user?.id])

  const unreadInsight = insights.find((insight) => !insight.is_read) || null

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from("insights")
        .update({ is_read: true })
        .eq("id", id)

      if (error) throw error

      // Refresh insights after marking as read
      await fetchInsights()
    } catch (error) {
      console.error("Error marking insight as read:", error)
    }
  }

  return { insights, unreadInsight, markAsRead, loading }
}
