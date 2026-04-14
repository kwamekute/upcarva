import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import logo from "../assets/logo.png"

export default function Home() {
  const [meals, setMeals] = useState([])
  const [hasLoggedToday, setHasLoggedToday] = useState(false)
  const [profile, setProfile] = useState(null)

  const navigate = useNavigate()
  const today = new Date().toISOString().split("T")[0]

  const fetchMeals = async () => {
  const { data: authData } = await supabase.auth.getUser()

  const user = authData?.user
  if (!user) return

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("log_date", today)
    .eq("auth_id", user.id)
    .order("created_at", { ascending: true })

  if (error) {
    console.error(error)
    return
  }

  setMeals(data || [])
  setHasLoggedToday(!!data?.length)
}

  const fetchProfile = async () => {
  const { data } = await supabase.auth.getUser()

  const user = data?.user
  if (!user) return

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  setProfile(profile)
}

  useEffect(() => {
    fetchMeals()
    fetchProfile()

    const handleFocus = () => fetchMeals()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const getState = () => {
    const hour = new Date().getHours()
    if (hasLoggedToday) return "safe"
    if (hour >= 18) return "danger"
    return "normal"
  }

  const state = getState()

  const getButtonText = () => {
    if (state === "danger") return "Don't break your streak 🔥"
    if (state === "normal") return "What did you eat?"
    return meals.length > 0 ? "Ate anything else?" : "Log your meal"
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-6">
      <div className="max-w-sm mx-auto">

        <div className="flex justify-center mb-2">
          <img src={logo} alt="Upcurva" className="h-20" />
        </div>

        {!hasLoggedToday && state === "danger" && (
          <div className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm mb-4 animate-pulse">
            ⚠️ Don't break your streak, {profile?.name || "friend"}.
          </div>
        )}

        {!hasLoggedToday && state === "normal" && (
          <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm mb-4">
            You haven't logged today, {profile?.name || "friend"}.
          </div>
        )}

        {hasLoggedToday && (
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm mb-4">
            You showed up today{profile?.name ? `, ${profile.name}` : ""} 🌿
          </div>
        )}

        <button
          onClick={() => navigate("/log")}
          className="w-full text-white py-3 rounded-xl font-medium mb-4"
          style={{
            background:
              state === "danger"
                ? "#ef4444"
                : state === "safe"
                ? "#22c55e"
                : "linear-gradient(135deg, #6a5cff, #ff7a18)"
          }}
        >
          {getButtonText()}
        </button>

        <div className="bg-white rounded-xl divide-y">
          {meals.length === 0 ? (
            <p className="p-4 text-center text-gray-400 text-sm">No meals logged yet</p>
          ) : (
            meals.map((meal, i) => (
              <div key={meal.id} className="p-3">
                <p className="font-medium">Meal {i + 1}</p>
                <p className="text-sm text-gray-700">{meal.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(meal.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}