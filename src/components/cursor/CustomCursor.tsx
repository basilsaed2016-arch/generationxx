'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Minimal glowing cyan cursor.
 *
 * - smooth spring follow
 * - grows on hover over interactive elements
 * - no particle trail (kept lightweight)
 * - disabled on touch devices
 */
export default function CustomCursor() {
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Outer ring lags slightly for an elegant trailing feel
  const ringX = useSpring(mouseX, { damping: 30, stiffness: 500, mass: 0.4 })
  const ringY = useSpring(mouseY, { damping: 30, stiffness: 500, mass: 0.4 })
  // Inner dot tracks precisely
  const dotX = useSpring(mouseX, { damping: 40, stiffness: 800, mass: 0.2 })
  const dotY = useSpring(mouseY, { damping: 40, stiffness: 800, mass: 0.2 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      setHovering(
        !!t.closest('a, button, [role="button"], input, textarea, select, [data-cursor="hover"]')
      )
    }
    const leave = () => setVisible(false)
    const enter = () => setVisible(true)

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
    }
  }, [mouseX, mouseY, visible])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: ringX,
          top: ringY,
          x: -16,
          y: -16,
          width: 32,
          height: 32,
          border: '1px solid rgba(0, 245, 212, 0.55)',
        }}
        animate={{
          scale: hovering ? 1.5 : 1,
          borderColor: hovering ? 'rgba(0, 245, 212, 1)' : 'rgba(0, 245, 212, 0.55)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      />
      {/* Center dot */}
      <motion.div
        className="absolute rounded-full bg-[#00F5D4]"
        style={{
          left: dotX,
          top: dotY,
          x: -3,
          y: -3,
          width: 6,
          height: 6,
          boxShadow: '0 0 8px rgba(0, 245, 212, 0.8)',
        }}
        animate={{ scale: hovering ? 0.4 : 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      />
    </div>
  )
}
