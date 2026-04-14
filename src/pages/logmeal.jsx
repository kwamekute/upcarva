import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

export default function LogMeal() {
  const [meals, setMeals] = useState([])
  const [text, setText] = useState("")
  const [reason, setReason] = useState("")
  const [cost, setCost] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState(null)

  const navigate = useNavigate()
  const today = new Date().toISOString().split("T")[0]

  // 🔥 GET USER FIRST
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        navigate("/login")
        return
      }

      setUser(data.user)
    }

    getUser()
  }, [])

  // 🔥 FETCH MEALS ONLY AFTER USER EXISTS
  useEffect(() => {
    if (!user) return

    fetchMeals()
  }, [user])

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("auth_id", user.id) // ✅ filter by user
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setMeals(data || [])
  }

  // ✅ ADD MEAL (linked to user)
  const addMeal = async () => {
    if (!text || !user) return

    const { error } = await supabase.from("meals").insert([
      {
        auth_id: user.id, // 🔥 THIS IS THE KEY
        description: text,
        reason,
        cost: cost ? parseFloat(cost) : null,
        log_date: today
      }
    ])

    if (error) {
      console.error(error)
      return
    }

    setText("")
    setReason("")
    setCost("")
    fetchMeals()
     
     // ✅ SUCCESS → go home
  navigate("/")
    
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6fa] px-4">

        <div className="w-full max-w-sm mb-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 text-sm"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
          <p className="text-gray-700 mb-6 text-lg font-medium">
            Nice. let's log it 🔥
          </p>

          <button
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white mb-4 mx-auto"
            style={{
              background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
            }}
          >
            🎤
          </button>

          <button
            className="text-white px-5 py-2 rounded-lg mb-4"
            style={{
              background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
            }}
          >
            Tap to Speak (coming soon)
          </button>

          <hr className="my-4" />

          <button
            onClick={() => setShowModal(true)}
            className="text-gray-600 hover:text-black transition"
          >
            📝 Type Instead
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">

          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">

            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Add Meal
            </h2>

            <input
              placeholder="Food & Quantity e.g(about half plate of rice..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full mb-3 p-2 border rounded-md"
            />

            <textarea
              placeholder="Reason / Context e.g (hungry, bored, craving, stressed.."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mb-3 p-2 border rounded-md"
            />

            <input
              placeholder="Cost (optional)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full mb-4 p-2 border rounded-md"
            />

            <button
              onClick={async () => {
                await addMeal()
                setShowModal(false)
              }}
              className="w-full text-white py-2 rounded-lg font-medium"
              style={{
                background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
              }}
            >
              Save Meal
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="mt-3 text-sm text-gray-500 w-full"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </>
  )
}