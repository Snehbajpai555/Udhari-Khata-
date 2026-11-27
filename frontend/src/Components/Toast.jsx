import { AnimatePresence, motion } from 'motion/react'

const Toast = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-[#172B4D] px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        {message}
      </motion.div>
    )}
  </AnimatePresence>
)

export default Toast
