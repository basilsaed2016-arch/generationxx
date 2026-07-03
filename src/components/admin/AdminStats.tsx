'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, ListChecks, Award, TrendingUp, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

type Stats = {
  totalUsers: number
  verifiedUsers: number
  totalQuestions: number
  enabledQuestions: number
  totalResults: number
  passedResults: number
  failedResults: number
  passRate: number
  categories: number
  recentResults: {
    id: string
    username: string
    percentage: number
    passed: boolean
    verified: boolean
    createdAt: string
  }[]
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: '#00F5D4' },
    { label: 'مواطنون مُوثّقون', value: stats.verifiedUsers, icon: ShieldCheck, color: '#10b981' },
    { label: 'أسئلة مفعّلة', value: stats.enabledQuestions, icon: CheckCircle2, color: '#00F5D4' },
    { label: 'عدد التصنيفات', value: stats.categories, icon: ListChecks, color: '#ffffff' },
    { label: 'إجمالي المحاولات', value: stats.totalResults, icon: Award, color: '#00F5D4' },
    { label: 'اجتازوا الاختبار', value: stats.passedResults, icon: CheckCircle2, color: '#10b981' },
    { label: 'لم يجتازوا', value: stats.failedResults, icon: XCircle, color: '#ef4444' },
    { label: 'نسبة النجاح', value: stats.passRate, suffix: '%', icon: TrendingUp, color: '#00F5D4' },
  ]

  return (
    <div>
      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="relative overflow-hidden p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-white">
                      <AnimatedCounter value={c.value} suffix={'suffix' in c ? (c as { suffix?: string }).suffix : ''} />
                    </div>
                    <div className="mt-1 text-xs text-white/50">{c.label}</div>
                  </div>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: `${c.color}15`,
                      border: `1px solid ${c.color}30`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: c.color }} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Recent results */}
      <div className="mt-6">
        <GlassCard className="p-5">
          <h2 className="mb-4 text-base font-bold text-white">آخر النتائج</h2>
          <div className="space-y-2">
            {stats.recentResults.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/40">لا توجد محاولات بعد.</p>
            ) : (
              stats.recentResults.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        r.passed ? 'bg-[#00F5D4]/15' : 'bg-red-500/15'
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 size={14} className="text-[#00F5D4]" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{r.username}</span>
                        {r.verified && (
                          <span className="flex items-center gap-0.5 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-bold text-green-400">
                            <ShieldCheck size={9} />
                            موثّق
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/40">
                        {new Date(r.createdAt).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-extrabold ${
                      r.passed ? 'text-[#00F5D4]' : 'text-red-400'
                    }`}
                  >
                    {r.percentage}%
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
