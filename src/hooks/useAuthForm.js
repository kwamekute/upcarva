import { useState } from "react"
import { supabase } from "../lib/supabase"

export function useAuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(true)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        const user = data.user
        if (!user) throw new Error("No user returned")

        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ auth_id: user.id }])

        if (profileError) throw profileError

        setMessage("Account created! Create your profile")
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    email, setEmail,
    password, setPassword,
    isSignUp, setIsSignUp,
    message,
    loading,
    handleSubmit,
  }
}