/**
 * components/Navbar.jsx
 */

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="glass border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow-blue">
              <Activity size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight text-white">
              Neura<span className="text-accent">Scan</span>
            </span>
          </div>

          {/* Status pill */}
          <div className="tag">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-slow" />
            <span>Model Online</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
