'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Save, Loader2, Tag } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

type Category = {
  id: string
  name: string
  color: string
  order: number
  _count?: { questions: number }
}

const COLORS = ['#00F5D4', '#5b8cff', '#ef476f', '#ffd166', '#8338ec', '#10b981', '#f97316']

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store' })
      const data = await res.json()
      setCats(data.categories ?? [])
    } catch {
      toast.error('فشل التحميل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!name.trim()) {
      toast.error('اسم التصنيف مطلوب')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error)
      }
      toast.success('تمت إضافة التصنيف')
      setName('')
      setColor(COLORS[0])
      setOpen(false)
      await load()
    } catch (e: any) {
      toast.error(e.message === 'name_exists' ? 'الاسم موجود مسبقاً' : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  // Note: delete endpoint isn't built (categories are referenced by questions).
  // For simplicity, hide + message.
  const tryDelete = (c: Category) => {
    if (c._count?.questions) {
      toast.error(`لا يمكن حذف "${c.name}" — يحتوي على ${c._count.questions} سؤال`)
      return
    }
    toast.info('حذف التصنيفات غير مفعّل حالياً عبر الـ API')
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">التصنيفات</h1>
          <p className="mt-1 text-sm text-white/60">
            نظّم أسئلة الاختبار حسب التصنيف.
          </p>
        </div>
        <GlowButton
          variant="primary"
          glow
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} />
          إضافة تصنيف
        </GlowButton>
      </header>

      {loading ? (
        <div className="flex justify-center py-12 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : cats.length === 0 ? (
        <GlassCard className="p-8 text-center text-white/50">
          لا توجد تصنيفات.
        </GlassCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="flex items-center gap-3 p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `${c.color}20`,
                    border: `1px solid ${c.color}40`,
                  }}
                >
                  <Tag className="h-5 w-5" style={{ color: c.color }} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-xs text-white/50">
                    {c._count?.questions ?? 0} سؤال
                  </div>
                </div>
                <button
                  onClick={() => tryDelete(c)}
                  data-cursor="hover"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-rose-500/20 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0b0e] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white">تصنيف جديد</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-white/70">الاسم</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: قواعد القيادة"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
                  />
                </label>
                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-white/70">اللون</span>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        data-cursor="hover"
                        className={`h-9 w-9 rounded-full transition-all ${
                          color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0b0e] scale-110' : ''
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <GlowButton
                  variant="ghost"
                  size="sm"
                  magnetic={false}
                  onClick={() => setOpen(false)}
                >
                  إلغاء
                </GlowButton>
                <GlowButton
                  variant="primary"
                  size="sm"
                  glow
                  onClick={create}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save size={16} />حفظ</>}
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
