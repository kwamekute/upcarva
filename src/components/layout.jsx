import { Outlet, Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { useInsights } from "../hooks/useInsights"

export default function Layout() {
  const location = useLocation()
  const { insights } = useInsights()

  const isActive = (path) =>
    location.pathname === path

  const hasUnreadInsights = insights.some((insight) => !insight.is_read)

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/insights", label: "Insights", icon: "💡" },
    { path: "/progress", label: "Progress", icon: "📊" },
    { path: "/history", label: "History", icon: "📝" }
  ]

  return (
    <div className="min-h-screen flex flex-col">

      {/* Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-200/50 px-3 py-3 flex justify-around backdrop-blur-sm">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              isActive(item.path)
                ? "text-green-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <motion.span
              animate={isActive(item.path) ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-lg relative"
            >
              {item.icon}
              {item.path === "/insights" && hasUnreadInsights && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-500"
                />
              )}
            </motion.span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive(item.path) && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-green-600 rounded-full"
                style={{ width: "24px" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}