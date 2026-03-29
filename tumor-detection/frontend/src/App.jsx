/**
 * App.jsx
 * ────────
 * Root component. Orchestrates the full user flow:
 *   1. Upload image
 *   2. Trigger analysis
 *   3. Show loading skeleton
 *   4. Display result or error
 */

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Background      from './components/Background'
import Navbar          from './components/Navbar'
import Upload          from './components/Upload'
import LoadingSkeleton from './components/LoadingSkeleton'
import Result          from './components/Result'
import ErrorCard       from './components/ErrorCard'
import StatsStrip      from './components/StatsStrip'
import usePredict, { STATUS } from './hooks/usePredict'

export default function App() {
  const [file, setFile] = useState(null)
  const { status, result, error, run, reset } = usePredict()

  const handleFileSelect = useCallback((f) => {
    setFile(f)
    // Clear previous result when a new file is selected
    if (f === null) reset()
  }, [reset])

  const handleAnalyze = useCallback(() => {
    if (file) run(file)
  }, [file, run])

  const handleReset = useCallback(() => {
    setFile(null)
    reset()
  }, [reset])

  const isLoading = status === STATUS.LOADING

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* ── Three.js canvas ───────────────────────────────────────────── */}
      <Background />

      {/* ── Grid texture overlay ──────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* ── Radial glow — top center ──────────────────────────────────── */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main
        className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20"
        style={{ minHeight: '100dvh' }}
      >
        {/* ── Hero Text ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                          bg-surface-2 border border-surface-border text-xs text-muted
                          font-mono mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            AI-Powered · Research Tool · v1.0
          </div>

          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight tracking-tight text-white mb-4">
            Tumor Detection
            <br />
            <span className="text-gradient-blue">from Medical Scans</span>
          </h1>

          <p className="text-muted text-base max-w-md mx-auto leading-relaxed">
            Upload a brain scan or medical image. Our neural network analyzes it
            in seconds and returns a structured prediction.
          </p>
        </motion.div>

        {/* ── Main Card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="card p-6 mb-4"
        >
          {/* Upload always visible (unless loading or has result) */}
          <AnimatePresence mode="wait">
            {status === STATUS.SUCCESS || status === STATUS.ERROR ? (
              /* Result / error replaces the upload area */
              null
            ) : (
              <motion.div
                key="upload-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Upload
                  file={file}
                  onFileSelect={handleFileSelect}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Loading Skeleton ────────────────────────────────────────── */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <LoadingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {status === STATUS.SUCCESS && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-4"
            >
              {/* Image preview alongside result */}
              {file && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card mb-4 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
                    <span className="text-muted text-xs font-mono uppercase tracking-widest">
                      Analyzed Image
                    </span>
                    <span className="tag ml-auto">{file.name}</span>
                  </div>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Analyzed scan"
                    className="w-full object-contain"
                    style={{ maxHeight: '300px' }}
                  />
                </motion.div>
              )}

              <Result result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {status === STATUS.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <ErrorCard error={error} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats strip ─────────────────────────────────────────────── */}
        <StatsStrip />

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-muted text-xs font-mono space-y-1"
        >
          <p>NeuraScan · Built for research purposes only</p>
          <p className="opacity-50">Not a substitute for professional medical advice</p>
        </motion.footer>
      </main>
    </div>
  )
}
