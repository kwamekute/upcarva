import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function History() {
  const [grouped, setGrouped] = useState({})
  const [user, setUser] = useState(null)


   useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      setUser(data.user)
    }

    getUser()
  }, [])

  const fetchMeals = async () => {
   
    const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) return

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("auth_id", user.id)
    .order("created_at", { ascending: false })


    if (error) {
      console.error(error)
      return
    }

    if (!data) return

    // ✅ group by log_date (IMPORTANT FIX)
    const groupedData = {}

    data.forEach((meal) => {
      const date = meal.log_date // more accurate than created_at

      if (!groupedData[date]) {
        groupedData[date] = []
      }

      groupedData[date].push({
        description: meal.description,
        reason: meal.reason
      })
    })

    setGrouped(groupedData)
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-6">
      <div className="max-w-sm mx-auto">

        <h1 className="text-lg font-semibold mb-4">
          History
        </h1>

        {Object.keys(grouped).length === 0 ? (
          <p className="text-gray-400 text-sm">
            No meals logged yet
          </p>
        ) : (
          Object.entries(grouped).map(([date, meals], i) => (
            <div
              key={i}
              className="bg-white p-3 rounded-lg mb-3"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-sm">
                  {date}
                </p>

                <div className="text-sm">
                  ✔
                </div>
              </div>

              <div className="text-gray-600 text-sm space-y-1">
                {meals.map((meal, index) => (
                  <div key={index}>
                    <p>{meal.description}</p>

                    {meal.reason && (
                      <p className="text-xs text-gray-400 italic">
                        {meal.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  )
}