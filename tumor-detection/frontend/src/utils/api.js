/**
 * utils/api.js
 * ─────────────
 * Centralised API layer. All backend calls go through here.
 * Uses native fetch — no axios needed.
 */

const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "")

console.log("🚀 API URL:", BASE_URL)

/**
 * POST /predict
 * Sends a FormData payload with the image file.
 *
 * @param {File} imageFile - The image File object from the browser
 * @returns {Promise<{ prediction: string, confidence: number, processing_time_ms: number }>}
 */
export async function predictTumor(imageFile) {
  console.log("📤 Sending request to:", `${BASE_URL}/predict`)
  const formData = new FormData()
  formData.append('file', imageFile)

  const response = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type manually — browser sets it with boundary
  })

  if (!response.ok) {
    let errorMessage = `Server error ${response.status}`
    try {
      const err = await response.json()
      errorMessage = err.detail || errorMessage
    } catch {
      /* ignore JSON parse failures */
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

/**
 * GET /health
 * @returns {Promise<{ status: string, model_loaded: boolean, version: string }>}
 */
export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`)
  if (!response.ok) throw new Error('API health check failed')
  return response.json()
}
