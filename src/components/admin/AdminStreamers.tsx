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
  ExternalLink,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import KickIcon from '@/components/ui/KickIcon'
import { toast } from 'sonner'

type Streamer = {
  id: string
  name: string
  kickSlug: string
  kickUrl: string
  avatar: string | null
  description: string | null
  order: number
  enabled: boolean
  isLive: boolean
  liveTitle: string | null
  liveViewerCount: number | null
}

type FormState = {
  id?: string
  name: string
  kickUrl: string
  avatar: string
  description: string
  enabled: boolean
  order: number
}

const EMPTY: FormState = {
  name: '',
  kickUrl: '',
  avatar: '',
  description: '',
  enabled: true,
  order: 0,
}

export default function AdminStreamers() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/streamers', { cache: 'no-store' })
      const data = await res.json()
      setStreamers(data.streamers ?? [])
    } catch {
      toast.error('فشل تحميل الستريمرز')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = streamers.filter(
    (s) =>
      !search ||
      s.name.includes(search) ||
      s.kickSlug.includes(search)
  )

  const save = async () => {
    if (!editing) return
    if (!editing.name || !editing.kickUrl) {
      toast.error('الاسم ورابط Kick مطلوبان')
      return
    }
    setSaving(true)
    try {
      const body = {
        name: editing.name,
        kickUrl: editing.kickUrl,
        avatar: editing.avatar || null,
        description: editing.description || null,
        enabled: editing.enabled,
        order: Number(editing.order) || 0,
      }
      let res: Response
      if (editing.id) {
        res = await fetch(`/api/admin/streamers/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/streamers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'failed')
      }
      toast.success(editing.id ? 'تم تحديث الستريمر' : 'تمت إضافة الستريمر')
      setEditing(null)
      await load()
    } catch (e: any) {
      toast.error(
        e.message === 'slug_exists'
          ? 'رابط Kick مستخدم مسبقاً'
          : 'فشل الحفظ'
      )
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('متأكد من حذف هذا الستريمر؟')) return
    try {
      const res = await fetch(`/api/admin/streamers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف الستريمر')
      await load()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const toggleEnabled = async (s: Streamer) => {
    try {
      const res = await fetch(`/api/admin/streamers/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !s.enabled }),
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      toast.error('فشل التحديث')
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">إدارة الستريمرز</h1>
          <p className="mt-1 text-sm text-white/60">
            إجمالي: {streamers.length} — نشط: {streamers.filter((s) => s.enabled).length} — مباشر الآن: {streamers.filter((s) => s.isLive).length}
          </p>
        </div>
        <GlowButton
          variant="primary"
          glow
          size="sm"
          onClick={() => setEditing({ ...EMPTY })}
        >
          <Plus size={16} />
          إضافة ستريمر
        </GlowButton>
      </header>

      <GlassCard className="mb-4 p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو Kick slug..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pr-10 pl-3 text-sm text-white placeholder:text-white/40 focus:border-[#00F5D4]/50 focus:outline-none"
          />
        </div>
      </GlassCard>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-white/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-8 text-center text-white/50">
            لا يوجد ستريمرز مطابقون.
          </GlassCard>
        ) : (
          filtered.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <GlassCard className={`p-4 transition-opacity ${s.enabled ? '' : 'opacity-50'}`}>
                <div className="flex items-start gap-3">
                  <GripVertical size={14} className="mt-1 text-white/30" />
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                    { }
                    <img
                      src={s.avatar || `https://api.dicebear.com/9.x/shapes/svg?seed=${s.kickSlug}&backgroundColor=090909`}
                      alt={s.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{s.name}</span>
                      {s.isLive && (
                        <span className="rounded-full border border-[#00F5D4]/40 bg-[#00F5D4]/15 px-2 py-0.5 text-[10px] font-bold text-[#00F5D4]">
                          LIVE
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-white/40">
                        <KickIcon className="h-3 w-3" />
                        {s.kickSlug}
                      </span>
                    </div>
                    {s.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-white/55">{s.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={s.kickUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
                      title="فتح على Kick"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <IconBtn
                      title={s.enabled ? 'تعطيل' : 'تفعيل'}
                      onClick={() => toggleEnabled(s)}
                    >
                      {s.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </IconBtn>
                    <IconBtn
                      title="تعديل"
                      onClick={() =>
                        setEditing({
                          id: s.id,
                          name: s.name,
                          kickUrl: s.kickUrl,
                          avatar: s.avatar ?? '',
                          description: s.description ?? '',
                          enabled: s.enabled,
                          order: s.order,
                        })
                      }
                    >
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn title="حذف" danger onClick={() => remove(s.id)}>
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

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
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0b0e] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white">
                  {editing.id ? 'تعديل ستريمر' : 'إضافة ستريمر جديد'}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="الاسم المعروض">
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="gx-input"
                    placeholder="مثال: Rayder TV"
                  />
                </Field>
                <Field label="رابط قناة Kick">
                  <input
                    value={editing.kickUrl}
                    onChange={(e) => setEditing({ ...editing, kickUrl: e.target.value })}
                    className="gx-input font-mono"
                    placeholder="https://kick.com/rayder-tv"
                  />
                </Field>
                <Field label="رابط صورة البروفايل (اختياري)">
                  <input
                    value={editing.avatar}
                    onChange={(e) => setEditing({ ...editing, avatar: e.target.value })}
                    className="gx-input font-mono"
                    placeholder="https://..."
                  />
                </Field>
                <Field label="وصف قصير">
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                    className="gx-input resize-none"
                    placeholder="نبذة عن الستريمر..."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="ترتيب العرض">
                    <input
                      type="number"
                      value={editing.order}
                      onChange={(e) =>
                        setEditing({ ...editing, order: Number(e.target.value) })
                      }
                      className="gx-input"
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

              <style jsx>{`
                .gx-input {
                  width: 100%;
                  height: 2.5rem;
                  border-radius: 0.5rem;
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  background: rgba(255, 255, 255, 0.03);
                  padding: 0 0.75rem;
                  font-size: 0.875rem;
                  color: #fff;
                  outline: none;
                  transition: border-color 0.2s;
                }
                .gx-input::placeholder { color: rgba(255,255,255,0.35); }
                .gx-input:focus { border-color: rgba(0, 245, 212, 0.5); }
                textarea.gx-input { padding: 0.6rem 0.75rem; height: auto; }
              `}</style>
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
