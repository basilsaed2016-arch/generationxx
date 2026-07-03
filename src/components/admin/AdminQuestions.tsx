'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  GripVertical,
  Search,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

type Category = { id: string; name: string; color: string }
type Question = {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correct: string
  enabled: boolean
  order: number
  timeLimit: number
  explanation: string | null
  categoryId: string | null
  category?: Category | null
}

type FormState = {
  id?: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correct: string
  enabled: boolean
  timeLimit: number
  explanation: string
  categoryId: string
}

const EMPTY: FormState = {
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correct: 'A',
  enabled: true,
  timeLimit: 60,
  explanation: '',
  categoryId: '',
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [q, c] = await Promise.all([
        fetch('/api/admin/questions', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/categories', { cache: 'no-store' }).then((r) => r.json()),
      ])
      setQuestions(q.questions ?? [])
      setCategories(c.categories ?? [])
    } catch {
      toast.error('فشل تحميل الأسئلة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = questions.filter((q) => {
    if (search && !q.text.includes(search)) return false
    if (filterCat && q.categoryId !== filterCat) return false
    return true
  })

  const save = async () => {
    if (!editing) return
    if (
      !editing.text ||
      !editing.optionA ||
      !editing.optionB ||
      !editing.optionC ||
      !editing.optionD
    ) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }
    setSaving(true)
    try {
      const body = {
        text: editing.text,
        optionA: editing.optionA,
        optionB: editing.optionB,
        optionC: editing.optionC,
        optionD: editing.optionD,
        correct: editing.correct,
        enabled: editing.enabled,
        timeLimit: Number(editing.timeLimit) || 60,
        explanation: editing.explanation || null,
        categoryId: editing.categoryId || null,
      }
      let res: Response
      if (editing.id) {
        res = await fetch(`/api/admin/questions/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('save_failed')
      toast.success(editing.id ? 'تم تحديث السؤال' : 'تمت إضافة السؤال')
      setEditing(null)
      await load()
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('متأكد من حذف هذا السؤال؟')) return
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف السؤال')
      await load()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const toggleEnabled = async (q: Question) => {
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !q.enabled }),
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      toast.error('فشل التحديث')
    }
  }

  const moveOrder = async (q: Question, dir: -1 | 1) => {
    try {
      await fetch(`/api/admin/questions/${q.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: q.order + dir }),
      })
      await load()
    } catch {
      toast.error('فشل إعادة الترتيب')
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">إدارة الأسئلة</h1>
          <p className="mt-1 text-sm text-white/60">
            إجمالي: {questions.length} — مفعّل: {questions.filter((q) => q.enabled).length}
          </p>
        </div>
        <GlowButton
          variant="primary"
          glow
          size="sm"
          onClick={() => setEditing({ ...EMPTY, categoryId: categories[0]?.id ?? '' })}
        >
          <Plus size={16} />
          إضافة سؤال
        </GlowButton>
      </header>

      {/* Filters */}
      <GlassCard className="mb-4 p-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في نص السؤال..."
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pr-10 pl-3 text-sm text-white placeholder:text-white/40 focus:border-[#00F5D4]/50 focus:outline-none"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0a0b0e]">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-white/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-8 text-center text-white/50">
            لا توجد أسئلة مطابقة.
          </GlassCard>
        ) : (
          filtered.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <GlassCard
                className={`p-4 transition-opacity ${
                  q.enabled ? '' : 'opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <GripVertical size={14} className="text-white/30" />
                    <span className="text-[10px] text-white/40">#{q.order}</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {q.category && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: `${q.category.color}20`,
                            color: q.category.color,
                          }}
                        >
                          {q.category.name}
                        </span>
                      )}
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                        صحيح: {q.correct}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                        {q.timeLimit}s
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{q.text}</p>
                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-white/60 sm:grid-cols-2">
                      <span className={q.correct === 'A' ? 'font-bold text-[#00F5D4]' : ''}>
                        A. {q.optionA}
                      </span>
                      <span className={q.correct === 'B' ? 'font-bold text-[#00F5D4]' : ''}>
                        B. {q.optionB}
                      </span>
                      <span className={q.correct === 'C' ? 'font-bold text-[#00F5D4]' : ''}>
                        C. {q.optionC}
                      </span>
                      <span className={q.correct === 'D' ? 'font-bold text-[#00F5D4]' : ''}>
                        D. {q.optionD}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <IconBtn title="تحريك لأعلى" onClick={() => moveOrder(q, -1)}>
                      <span className="text-xs">▲</span>
                    </IconBtn>
                    <IconBtn title="تحريك لأسفل" onClick={() => moveOrder(q, 1)}>
                      <span className="text-xs">▼</span>
                    </IconBtn>
                  </div>
                  <div className="flex flex-col gap-1">
                    <IconBtn
                      title={q.enabled ? 'تعطيل' : 'تفعيل'}
                      onClick={() => toggleEnabled(q)}
                    >
                      {q.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </IconBtn>
                    <IconBtn
                      title="تعديل"
                      onClick={() =>
                        setEditing({
                          id: q.id,
                          text: q.text,
                          optionA: q.optionA,
                          optionB: q.optionB,
                          optionC: q.optionC,
                          optionD: q.optionD,
                          correct: q.correct,
                          enabled: q.enabled,
                          timeLimit: q.timeLimit,
                          explanation: q.explanation ?? '',
                          categoryId: q.categoryId ?? '',
                        })
                      }
                    >
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn title="حذف" danger onClick={() => remove(q.id)}>
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit / add modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setEditing(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0b0e] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white">
                  {editing.id ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="نص السؤال">
                  <textarea
                    value={editing.text}
                    onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
                    placeholder="اكتب السؤال هنا..."
                  />
                </Field>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {LETTERS.map((L) => (
                    <Field key={L} label={`الخيار ${L}`}>
                      <div className="flex gap-2">
                        <input
                          value={(editing as any)[`option${L}`]}
                          onChange={(e) =>
                            setEditing({ ...editing, [`option${L}`]: e.target.value } as any)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
                        />
                        <button
                          onClick={() => setEditing({ ...editing, correct: L })}
                          data-cursor="hover"
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            editing.correct === L
                              ? 'bg-[#00F5D4] text-[#050505] gx-glow-sm'
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                          title="تحديد كإجابة صحيحة"
                        >
                          {L}
                        </button>
                      </div>
                    </Field>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="التصنيف">
                    <select
                      value={editing.categoryId}
                      onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
                    >
                      <option value="">عام</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0a0b0e]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="الوقت (ثانية)">
                    <input
                      type="number"
                      min={10}
                      max={600}
                      value={editing.timeLimit}
                      onChange={(e) =>
                        setEditing({ ...editing, timeLimit: Number(e.target.value) })
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
                    />
                  </Field>
                  <Field label="الحالة">
                    <label className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={editing.enabled}
                        onChange={(e) =>
                          setEditing({ ...editing, enabled: e.target.checked })
                        }
                        className="h-4 w-4 accent-[#00F5D4]"
                      />
                      مفعّل
                    </label>
                  </Field>
                </div>

                <Field label="شرح الإجابة (اختياري)">
                  <textarea
                    value={editing.explanation}
                    onChange={(e) =>
                      setEditing({ ...editing, explanation: e.target.value })
                    }
                    rows={2}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-[#00F5D4]/50 focus:outline-none"
                    placeholder="شرح يظهر بعد الاختبار..."
                  />
                </Field>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <GlowButton
                  variant="ghost"
                  size="sm"
                  magnetic={false}
                  onClick={() => setEditing(null)}
                >
                  إلغاء
                </GlowButton>
                <GlowButton
                  variant="primary"
                  size="sm"
                  glow
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      حفظ
                    </>
                  )}
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/70">{label}</span>
      {children}
    </label>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-white/60 transition-all hover:bg-white/10 ${
        danger ? 'hover:bg-rose-500/20 hover:text-rose-400' : 'hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
