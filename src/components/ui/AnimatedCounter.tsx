'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'

type Props = {
  value: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}

/**
 * Animated number that counts up when scrolled into view.
 */
export default function AnimatedCounter({
  value,
  duration = 1.8,
  className,
  suffix = '',
  prefix = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.floor(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration, mv])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
