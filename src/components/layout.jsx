import { Outlet, Link, useLocation } from "react-router-dom"

export default function Layout() {
  const location = useLocation()

  const isActive = (path) =>
    location.pathname === path ? "text-green-600" : "text-gray-400"

  return (
    <div className="min-h-screen flex flex-col">

      {/* Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t p-3 flex justify-around">

        <Link to="/" className={isActive("/")}>
          Home
        </Link>

        <Link to="/progress" className={isActive("/progress")}>
          Progress
        </Link>

        <Link to="/history" className={isActive("/history")}>
          History
        </Link>

      </div>
    </div>
  )
}