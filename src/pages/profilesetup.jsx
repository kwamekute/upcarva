import { useProfileSetup } from "../hooks/useProfileSetup"

export default function ProfileSetup() {
  const {
    name, setName,
    age, setAge,
    sex, setSex,
    height, setHeight,
    startingWeight, setStartingWeight,
    goal, setGoal,
    fitnessHistory, setFitnessHistory,
    activityLevel, setActivityLevel,
    handleSave,
  } = useProfileSetup()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">Lets get to know you</h2>

        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded mb-3" />
        <input placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border p-3 rounded mb-3" />

        <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full border p-3 rounded mb-3">
          <option value="">Sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input placeholder="Height (cm)" type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full border p-3 rounded mb-3" />
        <input placeholder="Starting Weight (kg)" type="number" step="0.1" value={startingWeight} onChange={(e) => setStartingWeight(e.target.value)} className="w-full border p-3 rounded mb-3" />

        <input placeholder="Fitness History, please be detailed" value={fitnessHistory} onChange={(e) => setFitnessHistory(e.target.value)} className="w-full border p-3 rounded mb-3"/>

        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full border p-3 rounded mb-3">
          <option value="">Activity Level</option>
          <option value="sedentary">Sedentary</option>
          <option value="light">Lightly Active</option>
          <option value="moderate">Moderately Active</option>
          <option value="very">Very Active</option>
        </select>

        <input placeholder="Goal (e.g. lose weight, gain muscle)" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full border p-3 rounded mb-3" />

        <button onClick={handleSave} className="w-full bg-black text-white py-3 rounded">
          Continue
        </button>
      </div>
    </div>
  )
}
