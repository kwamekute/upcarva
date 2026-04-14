import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Home from "./pages/home"
import LogMeal from "./pages/logmeal"
import Progress from "./pages/progress"
import History from "./pages/history"
import Layout from "./components/layout"
import Auth from "./pages/auth"
import ProfileSetup from "./pages/profilesetup"

function AppInner({ profileReady, onProfileComplete }) {
  if (!profileReady) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Routes>
          <Route path="/setup" element={<ProfileSetup onComplete={onProfileComplete} />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="log" element={<LogMeal />} />
          <Route path="progress" element={<Progress />} />
          <Route path="history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [profileReady, setProfileReady] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(false)

  const checkProfile = async (userId) => {
  setCheckingProfile(true)
  console.log("Checking profile for:", userId)
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", userId)
      .maybeSingle()
    
    console.log("Profile result:", { data, error })
    setProfileReady(!!data)
  } catch (err) {
    console.error("checkProfile failed:", err)
    setProfileReady(false)
  } finally {
    setCheckingProfile(false)
  }
}


useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session ?? null)
    }
  )

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])

useEffect(() => {
  if (!session) return

  checkProfile(session.user.id)
}, [session])

  useEffect(() => {
  console.log("STATE:", { session, checkingProfile, profileReady })
}, [session, checkingProfile, profileReady])
console.log("session:", session)
console.log("checkingProfile:", checkingProfile)
  // Still initialising
  if (session === undefined || checkingProfile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#999", fontSize: "14px" }}>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {!session ? (
        <Auth />
      ) : (
        <AppInner
          profileReady={profileReady}
          onProfileComplete={() => setProfileReady(true)}
        />
      )}
    </BrowserRouter>
  )
}