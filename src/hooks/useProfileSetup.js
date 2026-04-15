import { useState } from "react"
import { supabase } from "../lib/supabase"

export function useProfileSetup(onComplete) {
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

  return {
    name, setName,
    age, setAge,
    sex, setSex,
    height, setHeight,
    startingWeight, setStartingWeight,
    goal, setGoal,
    fitnessHistory, setFitnessHistory,
    activityLevel, setActivityLevel,
    handleSave,
  }
}