/**
 * components/Result.jsx
 * ──────────────────────
 * Displays prediction result with:
 *  - Clear visual hierarchy (Tumor = red, No Tumor = green)
 *  - Animated confidence bar
 *  - Processing metadata
 *  - Disclaimer footer
 */

import { motion } from 'framer-motion'
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  RotateCcw,
  TrendingUp,
  Info,
} from 'lucide-react'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function Result({ result, onReset }) {
  if (!result) return null

  const { prediction, confidence, processing_time_ms } = result
  const isTumor = prediction.toLowerCase().includes('tumor') &&
                  !prediction.toLowerCase().includes('no')

  const Icon        = isTumor ? ShieldAlert : ShieldCheck
  const accentColor = isTumor ? 'danger' : 'safe'
  const glowClass   = isTumor ? 'shadow-glow-red' : 'shadow-glow-green'
  const textClass   = isTumor ? 'text-danger-glow' : 'text-safe-glow'
  const borderClass = isTumor ? 'border-danger/25' : 'border-safe/25'
  const bgClass     = isTumor ? 'bg-danger/8' : 'bg-safe/8'
  const barClass    = isTumor ? 'bg-danger' : 'bg-safe'
  const iconBg      = isTumor ? 'bg-danger/15' : 'bg-safe/15'

  const confidenceLabel =
    confidence >= 90 ? 'Very High'
    : confidence >= 75 ? 'High'
    : confidence >= 60 ? 'Moderate'
    : 'Low'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`card border ${borderClass} overflow-hidden`}
    >
      {/* ── Top accent line ──────────────────────────────────────────────── */}
      <div className={`h-0.5 w-full ${barClass} opacity-60`} />

      <div className="p-6 space-y-6">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 ${glowClass}`}
            >
              <Icon size={22} className={textClass} strokeWidth={2} />
            </motion.div>

            <div>
              <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">
                Analysis Result
              </p>
              <h2 className={`font-display font-bold text-xl leading-tight ${textClass}`}>
                {prediction}
              </h2>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted
                       hover:text-white hover:bg-surface-3 transition-all text-xs font-medium
                       border border-transparent hover:border-surface-border flex-shrink-0"
          >
            <RotateCcw size={12} />
            New scan
          </button>
        </motion.div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="border-t border-surface-border" />

        {/* ── Confidence ───────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-muted" />
              <span className="text-muted text-sm">Model Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-full border
                            ${isTumor ? 'border-danger/30 text-danger-glow bg-danger/10'
                                      : 'border-safe/30 text-safe-glow bg-safe/10'}`}
              >
                {confidenceLabel}
              </span>
              <span className={`font-display font-bold text-2xl ${textClass}`}>
                {confidence.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="relative w-full h-2.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className={`absolute left-0 top-0 h-full ${barClass} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
            />
          </div>

          {/* Confidence scale labels */}
          <div className="flex justify-between text-muted text-[10px] font-mono">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </motion.div>

        {/* ── Meta info ────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className={`rounded-xl ${bgClass} border ${borderClass} p-4 flex items-center gap-6`}
        >
          <div className="flex items-center gap-2 text-sm">
            <Clock size={13} className="text-muted" />
            <span className="text-muted">Processing time</span>
            <span className="font-mono text-white font-medium">
              {processing_time_ms < 1000
                ? `${processing_time_ms.toFixed(0)} ms`
                : `${(processing_time_ms / 1000).toFixed(2)} s`}
            </span>
          </div>

          <div className="h-4 w-px bg-surface-border" />

          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse-slow" />
            <span className="text-muted">Model</span>
            <span className="font-mono text-white font-medium">v1.0</span>
          </div>
        </motion.div>

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2.5 text-xs text-muted leading-relaxed"
        >
          <Info size={13} className="flex-shrink-0 mt-0.5 opacity-60" />
          <p>
            This result is generated by an AI model for research purposes only.
            It is <strong className="text-white/70 font-medium">not a medical diagnosis</strong>.
            Always consult a qualified medical professional for clinical decisions.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
