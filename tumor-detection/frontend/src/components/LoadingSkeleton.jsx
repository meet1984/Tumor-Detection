/**
 * components/LoadingSkeleton.jsx
 * ────────────────────────────────
 * Shown while the backend is processing the image.
 */

import { motion } from 'framer-motion'

const pulse = {
  animate: { opacity: [0.4, 0.8, 0.4] },
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
}

function SkeletonBar({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <motion.div
      {...pulse}
      className={`${width} ${height} ${className} rounded-lg bg-surface-3`}
    />
  )
}

export default function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 space-y-6"
      aria-label="Analyzing image…"
      role="status"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.div
          {...pulse}
          className="w-12 h-12 rounded-2xl bg-surface-3 flex-shrink-0"
        />
        <div className="flex-1 space-y-2">
          <SkeletonBar width="w-36" height="h-4" />
          <SkeletonBar width="w-20" height="h-3" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Main metric */}
      <div className="space-y-3">
        <SkeletonBar width="w-24" height="h-3" />
        <SkeletonBar width="w-48" height="h-8" />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBar width="w-20" height="h-3" />
          <SkeletonBar width="w-12" height="h-3" />
        </div>
        <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent/40 rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        {[60, 80, 50].map((w, i) => (
          <motion.div
            key={i}
            {...pulse}
            style={{ transitionDelay: `${i * 0.1}s` }}
            className={`w-${w === 60 ? '16' : w === 80 ? '20' : '14'} h-6 rounded-full bg-surface-3`}
          />
        ))}
      </div>

      {/* Processing label */}
      <div className="flex items-center gap-2 text-muted text-sm">
        <motion.div
          className="w-2 h-2 rounded-full bg-accent"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        Running neural network analysis…
      </div>
    </motion.div>
  )
}
