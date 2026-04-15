import { useAuthForm } from "../hooks/useAuthForm"
import logo from "../assets/logo.png"

export default function Auth() {
  const {
    email, setEmail,
    password, setPassword,
    isSignUp, setIsSignUp,
    message,
    loading,
    handleSubmit,
  } = useAuthForm()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-2">
          <img src={logo} alt="Upcurva" className="h-21" />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-center">
          {isSignUp ? "Create account" : "Login"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full text-white px-5 py-2 rounded-lg mb-4"
          style={{ background: "linear-gradient(135deg, #6a5cff, #ff7a18)" }}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </button>

        <p
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-center cursor-pointer text-blue-500"
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </p>

        {message && (
          <p className="text-sm text-center mt-3">{message}</p>
        )}

      </div>
    </div>
  )
}
// import { useState } from "react"
// import { supabase } from "../lib/supabase"
// import logo from "../assets/logo.png"

// export default function Auth() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isSignUp, setIsSignUp] = useState(true)
//   const [message, setMessage] = useState("")
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async () => {
//   if (loading) return
//   setLoading(true)

//     console.log("1️⃣ START SUBMIT")

//   try {
//     if (isSignUp) {
//       console.log("2️⃣ BEFORE SIGNUP")
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password
//       })
//       console.log("3️⃣ AFTER SIGNUP", { data, error })

//       if (error) throw error

//       const user = data.user
//        console.log("4️⃣ USER", user)

//       if (!user) throw new Error("No user returned")
//          console.log("5️⃣ BEFORE PROFILE INSERT")
//       const { error: profileError } = await supabase
//         .from("profiles")
//         .insert([{ auth_id: user.id }])

//           console.log("6️⃣ AFTER PROFILE INSERT", profileError)


//       if (profileError) throw profileError

//      console.log("7️⃣ BEFORE NAVIGATE")

//       setMessage("Account created! Create your profile")
//       setIsSignUp(false)

//      // navigate("/setup") // immediate navigation (NO timeout needed)

//        console.log("8️⃣ AFTER NAVIGATE")

//     } else {
//        console.log("2️⃣ LOGIN FLOW START")

//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       })
//       console.log("3️⃣ LOGIN RESULT", error)

//       if (error) throw error

//      // navigate("/setup")
//     }

//   } catch (err) {
//     console.log("❌ ERROR:", err)
//     setMessage(err.message)

//   } finally {
//         console.log("🧹 FINALLY RUNNING")

//     setLoading(false)
//   }
// }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <div className="w-full max-w-sm">

//         <div className="flex justify-center mb-2">
//             <img src={logo} alt="Upcurva" className="h-21" />
//         </div>

//         <h2 className="text-xl font-semibold mb-4 text-center">
//           {isSignUp ? "Create account" : "Login"}
//         </h2>

//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full border p-3 rounded mb-3"
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full border p-3 rounded mb-3"
//         />

//         <button
//         type="button"
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full text-white px-5 py-2 rounded-lg mb-4"
//             style={{
//               background: "linear-gradient(135deg, #6a5cff, #ff7a18)"
//             }}
          
//         >
//           {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
//         </button>

//         <p
//           onClick={() => setIsSignUp(!isSignUp)}
//           className="text-sm text-center cursor-pointer text-blue-500"
//         >
//           {isSignUp
//             ? "Already have an account? Login"
//             : "Don't have an account? Sign up"}
//         </p>

//         {message && (
//           <p className="text-sm text-center mt-3">{message}</p>
//         )}

//       </div>
//     </div>
//   )
// }