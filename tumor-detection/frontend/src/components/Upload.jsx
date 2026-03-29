/**
 * components/Upload.jsx
 * ──────────────────────
 * Drag-and-drop + click-to-upload image selector.
 * Shows a live preview of the selected image.
 * Animated with Framer Motion.
 */

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, ImagePlus, X, ChevronRight, AlertCircle } from 'lucide-react'

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png':  ['.png'],
  'image/webp': ['.webp'],
  'image/bmp':  ['.bmp'],
}
const MAX_SIZE_MB = 10

export default function Upload({ onFileSelect, onAnalyze, file, isLoading }) {
  const [dropError, setDropError] = useState(null)

  // ── Dropzone ─────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted, rejected) => {
    setDropError(null)

    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large')   setDropError(`File exceeds ${MAX_SIZE_MB} MB limit.`)
      else if (err.code === 'file-invalid-type') setDropError('Please upload a JPEG, PNG, or WEBP image.')
      else setDropError(err.message)
      return
    }

    if (accepted[0]) onFileSelect(accepted[0])
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: isLoading,
  })

  const preview = file ? URL.createObjectURL(file) : null
  const hasFile = Boolean(file)

  return (
    <div className="w-full space-y-4">
      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      <motion.div
        {...getRootProps()}
        whileHover={!hasFile && !isLoading ? { scale: 1.005 } : {}}
        className={`
          relative rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragActive
            ? 'border-accent bg-accent/5 shadow-glow-blue'
            : hasFile
              ? 'border-surface-border bg-surface-1 cursor-default'
              : 'border-surface-border bg-surface-1 hover:border-accent/50 hover:bg-surface-2'
          }
          ${isLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}
        `}
        style={{ minHeight: hasFile ? 'auto' : '280px' }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {hasFile ? (
            /* ── Preview State ──────────────────────────────────────────── */
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Image */}
              <div className="relative w-full" style={{ maxHeight: '420px' }}>
                <img
                  src={preview}
                  alt="Selected medical image"
                  className="w-full object-contain rounded-2xl"
                  style={{ maxHeight: '420px' }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface/60 via-transparent to-transparent rounded-2xl pointer-events-none" />
              </div>

              {/* File info bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div>
                  <p className="text-white text-sm font-medium truncate max-w-[220px]">{file.name}</p>
                  <p className="text-muted text-xs font-mono mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB · {file.type.split('/')[1].toUpperCase()}
                  </p>
                </div>
                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onFileSelect(null) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-3/80
                             border border-surface-border text-muted hover:text-white
                             hover:bg-surface-3 transition-all text-xs font-medium backdrop-blur-sm"
                >
                  <X size={12} />
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Empty State ────────────────────────────────────────────── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-5
                  ${isDragActive ? 'bg-accent shadow-glow-blue' : 'bg-surface-3 border border-surface-border'}
                `}
              >
                <ImagePlus
                  size={28}
                  className={isDragActive ? 'text-white' : 'text-muted'}
                  strokeWidth={1.5}
                />
              </motion.div>

              <p className="text-white font-semibold text-base mb-1.5">
                {isDragActive ? 'Drop image here' : 'Upload Medical Image'}
              </p>
              <p className="text-muted text-sm max-w-xs leading-relaxed">
                {isDragActive
                  ? 'Release to select this file'
                  : 'Drag and drop your scan, or click to browse'}
              </p>

              <div className="flex items-center gap-2 mt-5">
                {['JPEG', 'PNG', 'WEBP', 'BMP'].map((fmt) => (
                  <span key={fmt} className="tag">{fmt}</span>
                ))}
                <span className="tag">≤ {MAX_SIZE_MB} MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Drop Error ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {dropError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                       bg-danger/10 border border-danger/30 text-danger text-sm"
          >
            <AlertCircle size={15} strokeWidth={2} />
            {dropError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Analyze Button ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasFile && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            onClick={onAnalyze}
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center gap-3 py-4 rounded-2xl
              font-semibold text-[15px] tracking-wide transition-all duration-200
              ${isLoading
                ? 'bg-accent/40 text-white/60 cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-dim shadow-glow-blue active:scale-[0.99]'
              }
            `}
          >
            {isLoading ? (
              <>
                <Spinner />
                Analyzing scan…
              </>
            ) : (
              <>
                <UploadIcon size={17} strokeWidth={2} />
                Run Analysis
                <ChevronRight size={17} strokeWidth={2} className="opacity-70" />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Mini spinner ────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="animate-spin-slow"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="9" r="7" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
