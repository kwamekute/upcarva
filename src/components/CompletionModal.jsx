import { AnimatePresence, motion } from "framer-motion"

export default function CompletionModal({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-end p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(10, 10, 30, 0.7)" }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 26
            }}
            className="w-full rounded-[22px] bg-white p-6 shadow-2xl"
          >
            {/* Pill */}
            <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-gray-200" />

            {/* Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                delay: 0.15
              }}
              className="mb-3 block text-center text-4xl"
            >
              🎯
            </motion.div>

            {/* Title */}
            <h1
              className="mb-2 text-center text-[22px] font-bold text-[#1a1a2e]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Discovery Complete.
            </h1>

            {/* Body */}
            <p className="mb-1 text-center text-[12px] leading-relaxed text-gray-400">
              You've logged 14 days of real eating behaviour.
              <br />
              Your full pattern is now ready.
            </p>

            {/* Micro copy */}
            <p className="mb-5 text-center text-[11px] font-medium italic text-[#7c5cbf]">
              Most people never complete this. You did.
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl bg-[#1a1a2e] py-3 text-[13px] font-bold text-white transition-all"
            >
              View your report →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
