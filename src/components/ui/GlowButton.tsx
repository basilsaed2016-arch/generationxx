'use client'

import { forwardRef, useRef, useState, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline' | 'discord'
type Size = 'sm' | 'md' | 'lg'

type Props = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant
  size?: Size
  children: ReactNode
  glow?: boolean
  magnetic?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[#00F5D4] text-[#050505] font-bold hover:bg-[#00d4b8]',
  ghost:
    'bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/[0.06]',
  outline:
    'bg-transparent text-[#00F5D4] border border-[#00F5D4]/40 hover:bg-[#00F5D4]/[0.06] hover:border-[#00F5D4]/70',
  discord:
    'bg-[#5865F2] text-white hover:bg-[#4752c4]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-6 text-base rounded-xl',
  lg: 'h-13 px-8 text-base rounded-xl',
}

/**
 * Minimal magnetic button.
 * - subtle magnetic pull (toggleable)
 * - no shine sweep, no heavy glow by default
 */
const GlowButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', size = 'md', children, glow = false, magnetic = true, ...rest }, ref) => {
    const innerRef = useRef<HTMLButtonElement | null>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    const setRefs = (node: HTMLButtonElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic) return
      const el = innerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const mx = e.clientX - (r.left + r.width / 2)
      const my = e.clientY - (r.top + r.height / 2)
      setOffset({ x: mx * 0.2, y: my * 0.3 })
    }
    const onLeave = () => setOffset({ x: 0, y: 0 })

    return (
      <motion.button
        ref={setRefs}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold transition-colors duration-200 select-none',
          sizes[size],
          variants[variant],
          glow && 'gx-glow-sm',
          className
        )}
        {...rest}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </motion.button>
    )
  }
)
GlowButton.displayName = 'GlowButton'

export default GlowButton
