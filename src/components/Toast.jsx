import { AnimatePresence, motion } from "framer-motion"

export default function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute left-3 right-3 top-3 z-50 flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/95 px-4 py-3 text-[11px] font-semibold text-slate-700 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
            className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" 
          />
          <span className="flex-1">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
