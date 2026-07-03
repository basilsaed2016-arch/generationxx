'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, Download, Award } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

type Result = {
  id: string
  score: number
  total: number
  percentage: number
  passed: boolean
  durationSec: number
  createdAt: string
  user: {
    id: string
    username: string
    discordId: string
    avatar: string | null
  }
}

export default function AdminResults() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'pass' | 'fail'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [exporting, setExporting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q,
        page: String(page),
        limit: '20',
      })
      if (status !== 'all') params.set('status', status)
      const res = await fetch(`/api/admin/results?${params}`, { cache: 'no-store' })
      const data = await res.json()
      setResults(data.results ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch {
      toast.error('فشل التحميل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
     
  }, [q, status, page])

  const exportJson = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/results?export=1', { method: 'POST' })
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gx-results-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('تم تصدير النتائج')
    } catch {
      toast.error('فشل التصدير')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">نتائج الاختبارات</h1>
          <p className="mt-1 text-sm text-white/60">
            كل محاولات الاختبار — إجمالي: {total}
          </p>
        </div>
        <GlowButton
          variant="outline"
          size="sm"
          magnetic={false}
          onClick={exportJson}
          disabled={exporting}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
          تصدير JSON
        </GlowButton>
      </header>

      <GlassCard className="mb-4 p-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              placeholder="ابحث باسم المستخدم..."
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pr-10 pl-3 text-sm text-white placeholder:text-white/40 focus:border-[#00F5D4]/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {(['all', 'pass', 'fail'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
                data-cursor="hover"
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  status === s
                    ? 'bg-[#00F5D4] text-[#050505]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {s === 'all' ? 'الكل' : s === 'pass' ? 'ناجح' : 'راسب'}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center py-12 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 p-12 text-center text-white/50">
          <Award size={40} className="text-white/30" />
          <p>لا توجد نتائج مطابقة.</p>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-2">
            {results.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <GlassCard className="flex items-center gap-4 p-4">
                  <div
                    className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl ${
                      r.passed ? 'bg-[#00F5D4]/15' : 'bg-rose-500/15'
                    }`}
                  >
                    <span
                      className={`text-base font-extrabold ${
                        r.passed ? 'text-[#00F5D4]' : 'text-rose-400'
                      }`}
                    >
                      {r.percentage}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">
                      {r.user.username}
                    </div>
                    <div className="text-[11px] text-white/40">
                      {r.score} / {r.total} صحيح · {Math.floor(r.durationSec / 60)}:
                      {(r.durationSec % 60).toString().padStart(2, '0')} دقيقة ·{' '}
                      {new Date(r.createdAt).toLocaleString('ar-EG')}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      r.passed
                        ? 'bg-[#00F5D4]/20 text-[#00F5D4]'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {r.passed ? 'ناجح' : 'راسب'}
                  </span>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 disabled:opacity-30"
              >
                السابق
              </button>
              <span className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 disabled:opacity-30"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
