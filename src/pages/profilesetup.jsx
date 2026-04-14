import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function ProfileSetup({ onComplete }) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [height, setHeight] = useState("")
  const [startingWeight, setStartingWeight] = useState("")
  const [goal, setGoal] = useState("")
  const [fitnessHistory, setFitnessHistory] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
const handleSave = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return

  const user = userData.user

  // validate required fields first, before hitting DB
  if (!name || !age || !sex || !height || !startingWeight || !goal || !fitnessHistory || !activityLevel) {
    alert("Please fill in all fields before continuing.")
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      age: parseInt(age),
      sex,
      height_cm: parseFloat(height),
      starting_weight_kg: parseFloat(startingWeight),
      goals: goal,
      fitness_history: fitnessHistory,
      activity_level: activityLevel,
    })
    .eq("auth_id", user.id)

  if (error) {
    console.error("Update failed:", error)
    alert("Something went wrong. Try again.")
    return
  }

  onComplete()
}

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Tell us about you
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <input
          placeholder="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <select
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        >
          <option value="">Biological Sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input
          placeholder="Height (cm)"
          type="number"
          step="0.1"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <input
          placeholder="Starting Weight (kg)"
          type="number"
          step="0.1"
          value={startingWeight}
          onChange={(e) => setStartingWeight(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <select
          value={fitnessHistory}
          onChange={(e) => setFitnessHistory(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        >
          <option value="">Fitness Experience</option>
          <option value="none">Never worked out</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        >
          <option value="">Activity Level</option>
          <option value="sedentary">Sedentary</option>
          <option value="light">Lightly Active</option>
          <option value="moderate">Moderately Active</option>
          <option value="very">Very Active</option>
        </select>

        <input
          placeholder="Goal (e.g. lose weight, gain muscle)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <button
          onClick={handleSave}
          className="w-full bg-black text-white py-3 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  )
}