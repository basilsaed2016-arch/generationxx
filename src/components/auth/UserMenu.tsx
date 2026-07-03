'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  User,
  Award,
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { toast } from 'sonner'

export default function UserMenu() {
  const { user, setUser, setView } = useApp()
  const [open, setOpen] = useState(false)

  if (!user) return null

  // Discord CDN avatar URL (or fall back to identicon for demo users)
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.${
        user.avatar.startsWith('a_') ? 'gif' : 'png'
      }?size=128`
    : user.discordId.startsWith('demo_')
    ? `https://api.dicebear.com/9.x/identicon/svg?seed=${user.discordId}`
    : 'https://cdn.discordapp.com/embed/avatars/0.png'

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    setUser(null)
    setView('home')
    setOpen(false)
    toast.success('تم تسجيل الخروج')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        data-cursor="hover"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pr-1 pl-3 transition-colors hover:border-[#00F5D4]/40 hover:bg-white/10"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[#00F5D4]/40">
          <Image
            src={avatarUrl}
            alt={user.username}
            fill
            unoptimized
            className="object-cover"
            sizes="32px"
          />
        </div>
        <span className="hidden text-sm font-semibold text-white sm:inline">
          {user.username}
        </span>
        {/* Verification dot indicator */}
        <span
          className={`h-2 w-2 rounded-full ${
            user.verified ? 'bg-green-400' : 'bg-red-400'
          }`}
          title={user.verified ? 'مواطن مُوثّق' : 'غير مُوثّق'}
        />
        <ChevronDown
          size={16}
          className={`text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b0e]/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="border-b border-white/5 p-4">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-sm font-bold text-white">
                    {user.username}
                  </p>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      user.isAdmin
                        ? 'bg-[#00F5D4]/15 text-[#00F5D4]'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {user.isAdmin ? 'مدير المدينة' : 'مواطن'}
                  </span>
                </div>

                {/* Verification badge */}
                <div className="mt-2">
                  {user.verified ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1.5 text-xs font-bold text-green-400">
                      <ShieldCheck size={13} />
                      Verified Citizen
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400">
                      <ShieldX size={13} />
                      Not Verified
                    </div>
                  )}
                </div>

                {/* Guild status (subtle) */}
                {!user.inGuild && (
                  <p className="mt-2 text-[10px] leading-relaxed text-white/40">
                    لم يتم العثور على عضويتك في سيرفر GenerationX. انضم إلى الديسكورد للحصول على التحقق.
                  </p>
                )}
              </div>

              {/* Menu items */}
              <div className="p-2">
                <MenuItem
                  icon={<User size={16} />}
                  label="حسابي"
                  onClick={() => {
                    setView('home')
                    setOpen(false)
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                    }, 60)
                  }}
                />
                <MenuItem
                  icon={<Award size={16} />}
                  label="نتائج الاختبار"
                  onClick={() => {
                    setView('exam')
                    setOpen(false)
                  }}
                />
                {user.isAdmin && (
                  <MenuItem
                    icon={<LayoutDashboard size={16} />}
                    label="لوحة التحكم"
                    onClick={() => {
                      setView('admin')
                      setOpen(false)
                    }}
                  />
                )}
                <div className="my-1 h-px bg-white/5" />
                <MenuItem
                  icon={<LogOut size={16} />}
                  label="تسجيل الخروج"
                  danger
                  onClick={logout}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right text-sm transition-colors hover:bg-white/5 ${
        danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-white/80'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      <ChevronLeft size={14} className="opacity-50" />
    </button>
  )
}
