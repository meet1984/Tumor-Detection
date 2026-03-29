/**
 * hooks/usePredict.js
 * ───────────────────
 * Encapsulates the full prediction lifecycle:
 *   idle → loading → success | error
 *
 * Usage:
 *   const { status, result, error, run, reset } = usePredict()
 *   await run(file)
 */

import { useState, useCallback } from 'react'
import { predictTumor } from '../utils/api'

export const STATUS = {
  IDLE:    'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR:   'error',
}

export default function usePredict() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [result, setResult] = useState(null)   // { prediction, confidence, processing_time_ms }
  const [error,  setError]  = useState(null)   // string

  const run = useCallback(async (file) => {
    if (!file) return
    setStatus(STATUS.LOADING)
    setResult(null)
    setError(null)

    try {
      const data = await predictTumor(file)
      setResult(data)
      setStatus(STATUS.SUCCESS)
    } catch (err) {
      setError(err.message || 'Unexpected error. Please try again.')
      setStatus(STATUS.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE)
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, run, reset }
}
