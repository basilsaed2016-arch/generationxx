'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Loader2,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

type Settings = {
  paypalEmail: string | null
  bankName: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankIban: string | null
  bankSwift: string | null
  cardProvider: string
  cardProviderKey: string | null
  currency: string
  taxPercent: number
  enabled: boolean
}

type Order = {
  id: string
  productId: string
  productName: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  customerName: string | null
  customerEmail: string | null
  createdAt: string
}

const EMPTY_SETTINGS: Settings = {
  paypalEmail: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIban: '',
  bankSwift: '',
  cardProvider: 'stripe',
  cardProviderKey: '',
  currency: 'USD',
  taxPercent: 0,
  enabled: true,
}

export default function AdminPayments() {
  const [tab, setTab] = useState<'settings' | 'orders'>('settings')
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings', { cache: 'no-store' })
      const data = await res.json()
      if (data.settings) {
        setSettings({ ...EMPTY_SETTINGS, ...data.settings })
      }
    } catch {
      toast.error('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/orders?${params}`, { cache: 'no-store' })
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      toast.error('فشل تحميل الطلبات')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (tab === 'orders') loadOrders()
     
  }, [tab, statusFilter])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error()
      toast.success('تم حفظ إعدادات الدفع')
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      toast.success('تم تحديث حالة الطلب')
      await loadOrders()
    } catch {
      toast.error('فشل التحديث')
    }
  }

  const exportOrders = () => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gx-orders-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">المدفوعات</h1>
        <p className="mt-1 text-sm text-white/60">
          إدارة إعدادات الدفع ومراجعة طلبات الشراء.
        </p>
      </header>

      {/* Tab switch */}
      <div className="mb-6 inline-flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
        <TabBtn label="إعدادات الدفع" active={tab === 'settings'} onClick={() => setTab('settings')} />
        <TabBtn label="الطلبات" active={tab === 'orders'} onClick={() => setTab('orders')} />
      </div>

      {/* ===== Settings tab ===== */}
      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Status */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">حالة نظام الدفع</h2>
                <p className="mt-1 text-xs text-white/55">
                  فعّل أو أوقف استقبال الطلبات الجديدة من المتجر.
                </p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) =>
                    setSettings({ ...settings, enabled: e.target.checked })
                  }
                  className="h-5 w-5 accent-[#00F5D4]"
                />
                <span className={`text-sm font-bold ${settings.enabled ? 'text-[#00F5D4]' : 'text-white/40'}`}>
                  {settings.enabled ? 'مفعّل' : 'متوقف'}
                </span>
              </label>
            </div>
          </GlassCard>

          {/* PayPal */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#00F5D4]" />
              <h2 className="text-sm font-bold text-white">PayPal</h2>
            </div>
            <Field label="بريد PayPal (البريد المرتبط بالحساب التجاري)">
              <input
                type="email"
                value={settings.paypalEmail || ''}
                onChange={(e) =>
                  setSettings({ ...settings, paypalEmail: e.target.value })
                }
                className="gx-input"
                placeholder="payments@generationx.gg"
                disabled={loading}
              />
            </Field>
            <p className="mt-2 text-[11px] text-white/40">
              عند ترك هذا الحقل فارغاً، لن تظهر PayPal كخيار في صفحة الدفع.
            </p>
          </GlassCard>

          {/* Card provider */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#00F5D4]" />
              <h2 className="text-sm font-bold text-white">مزوّد البطاقات (Visa / Mastercard)</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="المزوّد">
                <select
                  value={settings.cardProvider}
                  onChange={(e) =>
                    setSettings({ ...settings, cardProvider: e.target.value })
                  }
                  className="gx-input"
                  disabled={loading}
                >
                  <option value="stripe" className="bg-[#0a0b0e]">Stripe</option>
                  <option value="paymob" className="bg-[#0a0b0e]">Paymob</option>
                  <option value="manual" className="bg-[#0a0b0e]">معالجة يدوية</option>
                </select>
              </Field>
              <Field label="مفتاح المزوّد (Secret/Publishable)">
                <input
                  type="password"
                  value={settings.cardProviderKey || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, cardProviderKey: e.target.value })
                  }
                  className="gx-input font-mono"
                  placeholder="sk_live_..."
                  disabled={loading}
                />
              </Field>
            </div>
            <p className="mt-2 text-[11px] text-white/40">
              عند ترك المفتاح فارغاً، لن تظهر البطاقات كخيار في صفحة الدفع.
            </p>
          </GlassCard>

          {/* Bank */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[#00F5D4]" />
              <h2 className="text-sm font-bold text-white">الحساب البنكي</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="اسم البنك">
                <input
                  value={settings.bankName || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, bankName: e.target.value })
                  }
                  className="gx-input"
                  disabled={loading}
                />
              </Field>
              <Field label="اسم صاحب الحساب">
                <input
                  value={settings.bankAccountName || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountName: e.target.value })
                  }
                  className="gx-input"
                  disabled={loading}
                />
              </Field>
              <Field label="رقم الحساب">
                <input
                  value={settings.bankAccountNumber || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountNumber: e.target.value })
                  }
                  className="gx-input font-mono"
                  disabled={loading}
                />
              </Field>
              <Field label="IBAN">
                <input
                  value={settings.bankIban || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, bankIban: e.target.value })
                  }
                  className="gx-input font-mono"
                  disabled={loading}
                />
              </Field>
              <Field label="SWIFT / BIC">
                <input
                  value={settings.bankSwift || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, bankSwift: e.target.value })
                  }
                  className="gx-input font-mono"
                  disabled={loading}
                />
              </Field>
            </div>
          </GlassCard>

          {/* Currency + tax */}
          <GlassCard className="p-5">
            <h2 className="mb-4 text-sm font-bold text-white">العملة والضريبة</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="العملة">
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="gx-input"
                  disabled={loading}
                >
                  <option value="USD" className="bg-[#0a0b0e]">USD ($)</option>
                  <option value="EUR" className="bg-[#0a0b0e]">EUR (€)</option>
                  <option value="SAR" className="bg-[#0a0b0e]">SAR (﷼)</option>
                  <option value="AED" className="bg-[#0a0b0e]">AED (د.إ)</option>
                  <option value="GBP" className="bg-[#0a0b0e]">GBP (£)</option>
                </select>
              </Field>
              <Field label="نسبة الضريبة (%)">
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxPercent}
                  onChange={(e) =>
                    setSettings({ ...settings, taxPercent: Number(e.target.value) || 0 })
                  }
                  className="gx-input"
                  disabled={loading}
                />
              </Field>
            </div>
          </GlassCard>

          {/* Save */}
          <div className="flex justify-end">
            <GlowButton
              variant="primary"
              size="md"
              glow
              onClick={save}
              disabled={saving || loading}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  حفظ الإعدادات
                </>
              )}
            </GlowButton>
          </div>
        </div>
      )}

      {/* ===== Orders tab ===== */}
      {tab === 'orders' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
              {['', 'pending', 'paid', 'failed', 'refunded'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  data-cursor="hover"
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-[#00F5D4] text-[#050505]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s === '' ? 'الكل' : statusLabel(s)}
                </button>
              ))}
            </div>
            <GlowButton
              variant="outline"
              size="sm"
              magnetic={false}
              onClick={exportOrders}
            >
              <Download size={14} />
              تصدير
            </GlowButton>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-12 text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <GlassCard className="p-12 text-center text-white/50">
              لا توجد طلبات مطابقة.
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {orders.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <GlassCard className="flex flex-wrap items-center gap-4 p-4">
                    <StatusIcon status={o.status} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-white">
                        {o.productName}
                      </div>
                      <div className="text-[11px] text-white/40">
                        #{o.id.slice(-8).toUpperCase()} · {methodLabel(o.paymentMethod)} ·{' '}
                        {new Date(o.createdAt).toLocaleString('ar-EG')}
                      </div>
                      {o.customerName && (
                        <div className="mt-1 text-xs text-white/60">
                          {o.customerName}
                          {o.customerEmail && ` · ${o.customerEmail}`}
                        </div>
                      )}
                    </div>
                    <div className="text-base font-extrabold text-[#00F5D4]">
                      ${o.amount.toFixed(2)}
                    </div>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      data-cursor="hover"
                      className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white focus:border-[#00F5D4]/50 focus:outline-none"
                    >
                      <option value="pending" className="bg-[#0a0b0e]">قيد الانتظار</option>
                      <option value="paid" className="bg-[#0a0b0e]">مدفوع</option>
                      <option value="failed" className="bg-[#0a0b0e]">فشل</option>
                      <option value="refunded" className="bg-[#0a0b0e]">مسترجع</option>
                    </select>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

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
        .gx-input:disabled { opacity: 0.5; }
      `}</style>
    </div>
  )
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      className={`rounded-md px-4 py-2 text-xs font-semibold transition-all ${
        active ? 'bg-[#00F5D4] text-[#050505]' : 'text-white/60 hover:text-white'
      }`}
    >
      {label}
    </button>
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

function StatusIcon({ status }: { status: string }) {
  if (status === 'paid') return <CheckCircle2 className="h-5 w-5 text-[#00F5D4]" />
  if (status === 'failed') return <XCircle className="h-5 w-5 text-rose-400" />
  return <Clock className="h-5 w-5 text-amber-400" />
}

function statusLabel(s: string) {
  if (s === 'pending') return 'قيد الانتظار'
  if (s === 'paid') return 'مدفوع'
  if (s === 'failed') return 'فشل'
  if (s === 'refunded') return 'مسترجع'
  return s
}

function methodLabel(m: string) {
  if (m === 'paypal') return 'PayPal'
  if (m === 'card') return 'بطاقة'
  return 'تحويل بنكي'
}
