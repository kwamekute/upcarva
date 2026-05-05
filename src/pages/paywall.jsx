import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"

export default function Paywall() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [codeInput, setCodeInput] = useState("")
  const [codeError, setCodeError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const VALID_CODE = "UPCURVA26"

//   const handleCheckCode = async () => {
//     if (!codeInput.trim()) {
//       setCodeError("Enter a code")
//       return
//     }

//     setVerifying(true)
//     setCodeError("")

//     try {
//       // Query access_codes table
//       const { data, error } = await supabase
//         .from("access_codes")
//         .select("*")
//         .eq("code", codeInput.toUpperCase())
//         .single()

//       if (error || !data) {
//         setCodeError("Incorrect code. Check with your coach.")
//         setVerifying(false)
//         return
//       }

//       // Code valid — unlock phase 2 in profiles
//       const { error: updateError } = await supabase
//         .from("profiles")
//         .update({ phase2_unlocked: true })
//         .eq("id", session?.user?.id)

//       if (updateError) {
//         setCodeError("Error unlocking access. Try again.")
//         setVerifying(false)
//         return
//       }

//       // Success — navigate to calibration
//       navigate("/calibration")
//     } catch (err) {
//       console.error(err)
//       setCodeError("Something went wrong.")
//       setVerifying(false)
//     }
//   }
const handleCheckCode = async () => {
  if (!codeInput.trim()) {
    setCodeError("Enter a code")
    return
  }

  setVerifying(true)
  setCodeError("")

  // ✅ Hardcoded check
  if (codeInput.toUpperCase() !== VALID_CODE) {
    setCodeError("Incorrect code. Check with your coach.")
    setVerifying(false)
    return
  }

  try {
    // Unlock Phase 2
    const { error: updateError } = await supabase
  .from("profiles")
  .update({
    phase: 2,
    phase2_unlocked: true,
    phase2_unlocked_at: new Date().toISOString()
  })
  .eq("auth_id", session?.user?.id)
  
    if (updateError) {
      setCodeError("Error unlocking access. Try again.")
      setVerifying(false)
      return
    }

    // Success
    localStorage.setItem("upcarva_phase2_preview", "true")
    navigate("/")
  } catch (err) {
    console.error(err)
    setCodeError("Something went wrong.")
    setVerifying(false)
  }
}

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6fa] px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/report")}
        className="mb-8 text-[11px] text-gray-400 transition hover:text-gray-600"
      >
        ← Back to report
      </button>

      {/* Icon */}
      <div className="mb-6 text-center text-5xl">🔐</div>

      {/* Tag */}
      <div className="mb-3 text-center">
        <span className="inline-block rounded-full bg-teal-500/20 px-3 py-1 text-[10px] font-bold uppercase text-teal-600">
          Phase 2 — Calibration
        </span>
      </div>

      {/* Headline */}
      <h1 className="mb-2 text-center text-[20px] font-bold text-[#1a1a2e]">
        Calibration is where we start shaping your patterns.
      </h1>

      {/* Body */}
      <p className="mb-6 text-center text-[12px] text-gray-600">
        Access is unlocked monthly. One clear experiment every day, built around what your data showed.
      </p>

      {/* Price Card */}
      <div className="mx-auto mb-6 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-1 text-center">
          <span className="text-3xl font-bold text-[#1a1a2e]">GHS 99</span>
        </div>
        <p className="mb-4 text-center text-[11px] text-gray-500">per month</p>

        <div className="space-y-2 border-t border-gray-100 pt-4">
          {[
            "Daily experiment, built around your patterns",
            "Weekly check-ins and progress notes",
            "Day 30 full behaviour update",
            "Cancel anytime"
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-2 text-[11px] text-gray-700">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="mb-6 w-full rounded-xl bg-[#1a1a2e] py-3 text-[13px] font-bold text-white transition hover:bg-opacity-90"
        onClick={() => alert("Payment handled manually — contact your coach to proceed.")}
      >
        Get access
      </button>

      {/* Code Row */}
      <div className="mx-auto w-full max-w-sm space-y-2">
        <p className="text-center text-[11px] text-gray-500">Already have an access code?</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value.toUpperCase())
              setCodeError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCheckCode()
            }}
            placeholder="Enter your access code"
            maxLength="12"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] placeholder-gray-400 outline-none focus:border-teal-500"
          />
          <button
            onClick={handleCheckCode}
            disabled={verifying}
            className="rounded-lg bg-teal-500 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
          >
            {verifying ? "..." : "Unlock"}
          </button>
        </div>

        {codeError && <p className="text-[10px] text-red-500">{codeError}</p>}
      </div>
    </div>
  )
}
