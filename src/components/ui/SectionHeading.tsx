'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
  className?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        center && 'items-center text-center',
        className
      )}
    >
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#00F5D4]/25 bg-[#00F5D4]/[0.04] px-3 py-1 text-xs font-medium text-[#00F5D4]"
        >
          <span className="inline-block h-1 w-1 rounded-full bg-[#00F5D4]" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className={cn(
          'text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl',
          center && 'mx-auto'
        )}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className={cn(
            'max-w-2xl text-sm text-white/55 md:text-base',
            center && 'mx-auto'
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
