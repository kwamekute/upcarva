import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import { useData } from "./contexts/DataContext"

import Home from "./pages/home"
import Progress from "./pages/progress"
import History from "./pages/history"
import Layout from "./components/layout"
import Auth from "./pages/auth"
import ProfileSetup from "./pages/profilesetup"
import { DataProvider } from "./contexts/DataContext"

function AppInner() {
  const { profile, loading } = useData()

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#999", fontSize: "14px" }}>Loading data...</p>
      </div>
    )
  }

  if (!profile || !profile.name || !profile.age || !profile.sex || !profile.height_cm || !profile.starting_weight_kg || !profile.goals) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Routes>
          <Route path="/setup" element={<ProfileSetup />} />
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
          <Route path="progress" element={<Progress />} />
          <Route path="history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  const { session } = useAuth()

  if (session === undefined) {
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
        <DataProvider session={session}>
          <AppInner />
        </DataProvider>
      )}
    </BrowserRouter>
  )
}
