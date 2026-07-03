'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = HTMLMotionProps<'div'> & {
  glow?: boolean
  strong?: boolean
}

/**
 * Lightweight glass card.
 * - low backdrop-blur (8-10px)
 * - single hairline top border in cyan
 * - no heavy glow by default
 */
const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className, children, glow = false, strong = false, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl',
          strong ? 'gx-glass-strong' : 'gx-glass',
          glow && 'gx-glow-sm',
          className
        )}
        {...rest}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#00F5D4]/40 to-transparent" />
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

export default GlassCard
