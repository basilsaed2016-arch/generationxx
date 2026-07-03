'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import GlowButton from '@/components/ui/GlowButton'
import { requireAuthOrOpen } from '@/lib/store'

/**
 * Minimal, cinematic hero.
 *
 * - Large logo blending into the scene
 * - GENERATIONX RP title
 * - Short description
 * - Single Discord CTA
 * - Smooth fade-in animations only
 *
 * No Three.js, no particle field, no excessive glow.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 pt-24"
    >
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00F5D4]/25 bg-[#00F5D4]/[0.04] px-3 py-1 text-[11px] font-medium text-[#00F5D4]"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00F5D4] gx-animate-pulse-soft" />
          سيرفر FiveM الرول بلاي الأول عربياً
        </motion.div>

        {/* Logo — transparent version, blends naturally */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="relative mb-8"
        >
          <Image
            src="/gx-logo-transparent.webp"
            alt="GenerationX Roleplay"
            width={280}
            height={133}
            style={{ width: '18rem', height: 'auto' }}
            className="max-w-[60vw]"
            priority
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          GENERATIONX{' '}
          <span className="gx-text-gradient">RP</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-5 max-w-xl text-sm text-white/60 sm:text-base md:text-lg"
        >
          ابدأ رحلتك في أفضل تجربة رول بلاي داخل عالم FiveM.
          <br className="hidden sm:block" />
          مدينة سينمائية، حياة واقعية، وقوانين تحترمك.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <GlowButton
            variant="primary"
            size="lg"
            onClick={() => requireAuthOrOpen('exam')}
          >
            دخول المدينة
          </GlowButton>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg/gx-rp'}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
          >
            <GlowButton variant="discord" size="lg" magnetic={false}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a.07.07 0 0 0-.075.04c-.32.57-.676 1.314-.924 1.9a18.36 18.36 0 0 0-5.118 0 12.6 12.6 0 0 0-.938-1.9.07.07 0 0 0-.075-.04c-1.305.232-2.554.644-3.76 1.369a.06.06 0 0 0-.03.026C2.794 8.36 1.94 12.21 2.014 16.012a.08.08 0 0 0 .031.055 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.07.07 0 0 0-.041-.098 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.117c.126-.094.252-.192.371-.291a.07.07 0 0 1 .073-.01c3.928 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .074.009c.12.099.245.198.372.292a.07.07 0 0 1-.006.117c-.596.349-1.22.645-1.873.891a.07.07 0 0 0-.04.1c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.074-4.394-.783-8.223-3.305-11.617a.06.06 0 0 0-.03-.026ZM9.015 13.78c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
              </svg>
              الانضمام إلى الديسكورد
            </GlowButton>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — minimal */}
      <motion.button
        onClick={() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-[#00F5D4]"
        data-cursor="hover"
        aria-label="انتقل للأسفل"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>
    </section>
  )
}
