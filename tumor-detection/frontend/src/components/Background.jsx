/**
 * components/Background.jsx
 * ──────────────────────────
 * Subtle Three.js particle field.
 * Renders to a fixed canvas behind all content.
 * Performance: only animates when tab is visible.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 800
const SPREAD = 120

export default function Background() {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ── Scene Setup ───────────────────────────────────────────────────────
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: false })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(el.clientWidth, el.clientHeight)
    camera.position.z = 60

    // ── Particles ─────────────────────────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes     = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * SPREAD
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD
      sizes[i] = Math.random() * 1.2 + 0.3
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.3,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // ── Second ring (dimmer, larger) ──────────────────────────────────────
    const ringMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.15,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
    })
    const ringParticles = new THREE.Points(geometry, ringMaterial)
    ringParticles.rotation.y = Math.PI / 4
    scene.add(ringParticles)

    // ── Animation Loop ────────────────────────────────────────────────────
    let animId
    let isVisible = true

    const animate = () => {
      if (!isVisible) return
      animId = requestAnimationFrame(animate)

      const t = Date.now() * 0.00008
      particles.rotation.y = t * 0.6
      particles.rotation.x = t * 0.2

      ringParticles.rotation.y = -t * 0.4
      ringParticles.rotation.z = t * 0.15

      renderer.render(scene, camera)
    }
    animate()

    // ── Pause when tab hidden (perf) ──────────────────────────────────────
    const handleVisibility = () => {
      isVisible = !document.hidden
      if (isVisible) animate()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // ── Resize ────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!el) return
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(el.parentElement || document.body)

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('visibilitychange', handleVisibility)
      ro.disconnect()
      geometry.dispose()
      material.dispose()
      ringMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
