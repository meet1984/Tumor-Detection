/**
 * components/StatsStrip.jsx
 * ──────────────────────────
 * Horizontal strip of static feature callouts shown below the main card.
 */

import { motion } from 'framer-motion'
import { Zap, Lock, Layers, FlaskConical } from 'lucide-react'

const stats = [
  { icon: Zap,          label: 'Fast Inference',   value: '< 500ms',      desc: 'Average response time' },
  { icon: Lock,         label: 'Private',          value: '100%',         desc: 'Image never stored' },
  { icon: Layers,       label: 'Architecture',     value: 'CNN',          desc: 'Convolutional neural net' },
  { icon: FlaskConical, label: 'Research Use',     value: 'Only',         desc: 'Not a clinical tool' },
]

export default function StatsStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {stats.map(({ icon: Icon, label, value, desc }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5 + i * 0.06 }}
          className="card p-4 flex flex-col gap-2 group hover:border-surface-3 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center
                          group-hover:bg-accent/10 transition-colors">
            <Icon size={15} className="text-muted group-hover:text-accent-glow transition-colors" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm font-mono">{value}</p>
            <p className="text-muted text-xs mt-0.5">{label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
