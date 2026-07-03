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

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image: string | null
  badge: string | null
  order: number
  enabled: boolean
  categoryId: string | null
  category: { id: string; name: string; slug: string } | null
}

type Category = { id: string; name: string; slug: string; _count?: { products: number } }

type FormState = {
  id?: string
  name: string
  description: string
  price: string
  currency: string
  image: string
  badge: string
  categoryId: string
  enabled: boolean
  order: number
}

const EMPTY: FormState = {
  name: '',
  description: '',
  price: '',
  currency: 'USD',
  image: '',
  badge: '',
  categoryId: '',
  enabled: true,
  order: 0,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        fetch('/api/admin/products', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/product-categories', { cache: 'no-store' }).then((r) => r.json()),
      ])
      setProducts(p.products ?? [])
      setCategories(c.categories ?? [])
    } catch {
      toast.error('فشل تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = products.filter((p) => {
    if (search && !p.name.includes(search)) return false
    if (filterCat && p.categoryId !== filterCat) return false
    return true
  })

  const save = async () => {
    if (!editing) return
    if (!editing.name || !editing.price) {
      toast.error('الاسم والسعر مطلوبان')
      return
    }
    setSaving(true)
    try {
      const body = {
        name: editing.name,
        description: editing.description || null,
        price: Number(editing.price) || 0,
        currency: editing.currency,
        image: editing.image || null,
        badge: editing.badge || null,
        categoryId: editing.categoryId || null,
        enabled: editing.enabled,
        order: Number(editing.order) || 0,
      }
      let res: Response
      if (editing.id) {
        res = await fetch(`/api/admin/products/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error()
      toast.success(editing.id ? 'تم تحديث المنتج' : 'تمت إضافة المنتج')
      setEditing(null)
      await load()
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('متأكد من حذف هذا المنتج؟')) return
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      toast.success('تم حذف المنتج')
      await load()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const toggleEnabled = async (p: Product) => {
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !p.enabled }),
      })
      await load()
    } catch {
      toast.error('فشل التحديث')
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">إدارة المنتجات</h1>
          <p className="mt-1 text-sm text-white/60">
            إجمالي: {products.length} — نشط: {products.filter((p) => p.enabled).length}
          </p>
        </div>
        <GlowButton
          variant="primary"
          glow
          size="sm"
          onClick={() =>
            setEditing({ ...EMPTY, categoryId: categories[0]?.id ?? '' })
          }
        >
          <Plus size={16} />
          إضافة منتج
        </GlowButton>
      </header>

      <GlassCard className="mb-4 p-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المنتج..."
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

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-white/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-8 text-center text-white/50">
            لا توجد منتجات مطابقة.
          </GlassCard>
        ) : (
          filtered.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <GlassCard className={`p-4 transition-opacity ${p.enabled ? '' : 'opacity-50'}`}>
                <div className="flex items-start gap-3">
                  <GripVertical size={14} className="mt-1 text-white/30" />
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/30">
                    { }
                    <img
                      src={p.image || '/products/catalog-1.png'}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{p.name}</span>
                      {p.badge && (
                        <span className="rounded-full bg-[#00F5D4]/15 px-2 py-0.5 text-[10px] font-bold text-[#00F5D4]">
                          {p.badge}
                        </span>
                      )}
                      {p.category && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                          {p.category.name}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-white/55">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-1 text-sm font-bold text-[#00F5D4]">
                      ${p.price.toFixed(2)} <span className="text-[10px] text-white/40">{p.currency}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBtn
                      title={p.enabled ? 'تعطيل' : 'تفعيل'}
                      onClick={() => toggleEnabled(p)}
                    >
                      {p.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </IconBtn>
                    <IconBtn
                      title="تعديل"
                      onClick={() =>
                        setEditing({
                          id: p.id,
                          name: p.name,
                          description: p.description ?? '',
                          price: String(p.price),
                          currency: p.currency,
                          image: p.image ?? '',
                          badge: p.badge ?? '',
                          categoryId: p.categoryId ?? '',
                          enabled: p.enabled,
                          order: p.order,
                        })
                      }
                    >
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn title="حذف" danger onClick={() => remove(p.id)}>
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
                  {editing.id ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="اسم المنتج">
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="gx-input"
                    placeholder="مثال: VIP Car"
                  />
                </Field>
                <Field label="الوصف القصير">
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={2}
                    className="gx-input resize-none"
                    placeholder="وصف المنتج..."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="السعر">
                    <input
                      type="number"
                      step="0.01"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({ ...editing, price: e.target.value })
                      }
                      className="gx-input"
                      placeholder="50.00"
                    />
                  </Field>
                  <Field label="العملة">
                    <input
                      value={editing.currency}
                      onChange={(e) =>
                        setEditing({ ...editing, currency: e.target.value })
                      }
                      className="gx-input"
                      placeholder="USD"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="التصنيف">
                    <select
                      value={editing.categoryId}
                      onChange={(e) =>
                        setEditing({ ...editing, categoryId: e.target.value })
                      }
                      className="gx-input"
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0a0b0e]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="شارة (Badge)">
                    <input
                      value={editing.badge}
                      onChange={(e) =>
                        setEditing({ ...editing, badge: e.target.value })
                      }
                      className="gx-input"
                      placeholder="مثال: حصري"
                    />
                  </Field>
                </div>
                <Field label="رابط صورة المنتج">
                  <input
                    value={editing.image}
                    onChange={(e) =>
                      setEditing({ ...editing, image: e.target.value })
                    }
                    className="gx-input font-mono"
                    placeholder="/products/my-image.png"
                  />
                  {editing.image && (
                    <div className="mt-2 h-20 w-32 overflow-hidden rounded-lg bg-black/30">
                      { }
                      <img
                        src={editing.image}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
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
