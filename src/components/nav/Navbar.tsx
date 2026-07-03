'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp, requireAuthOrOpen, type View } from '@/lib/store'
import UserMenu from '@/components/auth/UserMenu'
import GlowButton from '@/components/ui/GlowButton'

type NavItem = { label: string; view?: View; section?: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', view: 'home', section: 'hero' },
  { label: 'من نحن', section: 'about' },
  { label: 'الاختبار الإلكتروني', view: 'exam' },
  { label: 'المتجر', section: 'store' },
  { label: 'الستريمرز', section: 'streamers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, view, setView, mobileNavOpen, setMobileNavOpen, setAuthOpen } = useApp()

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (item: NavItem) => {
    setMobileNavOpen(false)
    if (item.view === 'exam') {
      requireAuthOrOpen('exam')
      return
    }
    if (item.view === 'home' && view !== 'home') {
      setView('home')
      setTimeout(() => {
        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return
    }
    if (item.section) {
      if (view !== 'home') {
        setView('home')
        setTimeout(() => {
          document.getElementById(item.section!)?.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      } else {
        document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
          scrolled
            ? 'border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:h-18">
          {/* Logo — transparent version */}
          <button
            onClick={() => handleClick({ label: 'الرئيسية', view: 'home', section: 'hero' })}
            className="relative flex items-center transition-opacity hover:opacity-90"
            data-cursor="hover"
          >
            <Image
              src="/gx-logo-transparent.webp"
              alt="GenerationX Roleplay"
              width={88}
              height={42}
              style={{ width: 'auto', height: '2rem' }}
              className="object-contain md:!h-9"
              priority
            />
          </button>

          {/* Desktop nav — single line, premium spacing */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.view && view === item.view
              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  data-cursor="hover"
                  className="group relative text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  <span className={cn(active && 'text-[#00F5D4]')}>{item.label}</span>
                  <span className="absolute -bottom-1.5 right-0 h-px w-0 bg-[#00F5D4] transition-all duration-300 group-hover:w-full" />
                </button>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu />
            ) : (
              <GlowButton
                size="sm"
                variant="primary"
                onClick={() => setAuthOpen(true)}
                className="hidden sm:inline-flex"
                magnetic={false}
              >
                تسجيل الدخول
              </GlowButton>
            )}

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white md:hidden"
              data-cursor="hover"
              aria-label="القائمة"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 right-0 flex w-72 flex-col gap-1 bg-[#0a0b0e] p-6 pt-24"
            >
              {NAV_ITEMS.map((item, idx) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * idx }}
                  onClick={() => handleClick(item)}
                  className="rounded-lg px-4 py-3 text-right text-base font-semibold text-white/90 hover:bg-white/5"
                >
                  {item.label}
                </motion.button>
              ))}
              {!user && (
                <GlowButton
                  variant="primary"
                  size="md"
                  className="mt-4"
                  magnetic={false}
                  onClick={() => {
                    setMobileNavOpen(false)
                    setAuthOpen(true)
                  }}
                >
                  تسجيل الدخول
                </GlowButton>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
