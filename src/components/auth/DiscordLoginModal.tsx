'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

export default function DiscordLoginModal() {
  const { authOpen, setAuthOpen, fetchUser, setView, setPendingView } = useApp()
  const [loading, setLoading] = useState(false)
  const [demoName, setDemoName] = useState('')
  const [demoAvailable, setDemoAvailable] = useState(false)

  // Check if Discord OAuth is configured (demo mode available when not)
  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((d) => setDemoAvailable(d.demoAvailable ?? false))
      .catch(() => setDemoAvailable(false))
  }, [])

  const close = () => {
    setAuthOpen(false)
    setDemoName('')
  }

  const discordLogin = () => {
    setLoading(true)
    // Real Discord OAuth redirect
    window.location.href = '/api/auth/discord'
  }

  const demoLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: demoName || 'زائر GenerationX' }),
      })
      if (!res.ok) throw new Error('failed')
      await fetchUser()
      toast.success('تم تسجيل الدخول بنجاح')
      close()
      const pending = useApp.getState().pendingView
      if (pending) {
        setView(pending)
        setPendingView(null)
      }
    } catch {
      toast.error('فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b0e] p-8"
          >
            <button
              onClick={close}
              className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
              data-cursor="hover"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <Image
                src="/gx-logo-transparent.webp"
                alt="GenerationX"
                width={144}
                height={68}
                style={{ width: '9rem', height: 'auto' }}
                className="mb-4"
              />
              <h2 className="text-2xl font-extrabold text-white">
                تسجيل الدخول إلى <span className="gx-text-cyan">GenerationX</span>
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/60">
                سجّل دخولك عبر ديسكورد للوصول إلى الاختبار الإلكتروني ونتائجك وحسابك الشخصي.
                سيتم التحقق من عضويتك في سيرفر GenerationX تلقائياً.
              </p>

              {/* Discord OAuth button */}
              <GlowButton
                variant="discord"
                size="lg"
                className="mt-6 w-full"
                magnetic={false}
                onClick={discordLogin}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a.07.07 0 0 0-.075.04c-.32.57-.676 1.314-.924 1.9a18.36 18.36 0 0 0-5.118 0 12.6 12.6 0 0 0-.938-1.9.07.07 0 0 0-.075-.04c-1.305.232-2.554.644-3.76 1.369a.06.06 0 0 0-.03.026C2.794 8.36 1.94 12.21 2.014 16.012a.08.08 0 0 0 .031.055 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.07.07 0 0 0-.041-.098 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.117c.126-.094.252-.192.371-.291a.07.07 0 0 1 .073-.01c3.928 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .074.009c.12.099.245.198.372.292a.07.07 0 0 1-.006.117c-.596.349-1.22.645-1.873.891a.07.07 0 0 0-.04.1c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.074-4.394-.783-8.223-3.305-11.617a.06.06 0 0 0-.03-.026ZM9.015 13.78c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
                  </svg>
                )}
                <span>المتابعة عبر ديسكورد</span>
              </GlowButton>

              {/* Demo fallback — only shown when Discord OAuth is NOT configured */}
              {demoAvailable && (
                <>
                  <div className="my-5 flex w-full items-center gap-3 text-xs text-white/40">
                    <div className="h-px flex-1 bg-white/10" />
                    <span>أو تجربة سريعة (وضع التطوير)</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="flex w-full flex-col gap-3">
                    <input
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder="اكتب اسم اللاعب للتجربة"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-[#00F5D4]/60 focus:outline-none"
                    />
                    <GlowButton
                      variant="outline"
                      size="md"
                      className="w-full"
                      magnetic={false}
                      onClick={demoLogin}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'دخول تجريبي'}
                    </GlowButton>
                  </div>
                </>
              )}

              <p className="mt-4 text-[11px] leading-relaxed text-white/40">
                بتسجيل الدخول أنت توافق على قواعد سيرفر GenerationX وسياسة الخصوصية.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
