/**
 * components/ErrorCard.jsx
 * ─────────────────────────
 * Shown when the API returns an error.
 */

import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Wifi, Server, FileX } from 'lucide-react'

function getErrorMeta(message) {
  const msg = message?.toLowerCase() || ''
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return {
      icon: Wifi,
      title: 'Connection Failed',
      hint: 'Cannot reach the server. Make sure the backend is running on port 8000.',
    }
  }
  if (msg.includes('500') || msg.includes('inference') || msg.includes('model')) {
    return {
      icon: Server,
      title: 'Model Error',
      hint: 'The model encountered an error processing this image. Try a different file.',
    }
  }
  if (msg.includes('unsupported') || msg.includes('type') || msg.includes('format')) {
    return {
      icon: FileX,
      title: 'Invalid File',
      hint: 'Only JPEG, PNG, or WEBP images are supported.',
    }
  }
  return {
    icon: AlertTriangle,
    title: 'Something went wrong',
    hint: message || 'An unexpected error occurred.',
  }
}

export default function ErrorCard({ error, onReset }) {
  const { icon: Icon, title, hint } = getErrorMeta(error)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="card border border-danger/25 p-6 space-y-5"
    >
      {/* Icon + heading */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-danger-glow" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-muted text-xs font-mono uppercase tracking-widest mb-0.5">Error</p>
          <h3 className="font-semibold text-white text-base">{title}</h3>
        </div>
      </div>

      {/* Message */}
      <p className="text-muted text-sm leading-relaxed pl-0">{hint}</p>

      {/* Raw error in monospace (collapsible) */}
      <details className="group">
        <summary className="text-xs text-muted cursor-pointer hover:text-white transition-colors list-none flex items-center gap-1.5">
          <span className="group-open:rotate-90 inline-block transition-transform">›</span>
          Technical details
        </summary>
        <pre className="mt-2 px-3 py-2.5 rounded-xl bg-surface-3 border border-surface-border
                        text-[11px] font-mono text-muted overflow-x-auto whitespace-pre-wrap">
          {error}
        </pre>
      </details>

      {/* Action */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   border border-surface-border text-white text-sm font-medium
                   hover:bg-surface-3 hover:border-muted transition-all"
      >
        <RotateCcw size={14} />
        Try Again
      </button>
    </motion.div>
  )
}
