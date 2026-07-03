'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Wallet,
  Banknote,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

type PaymentSettings = {
  currency: string
  taxPercent: number
  enabled: boolean
  methods: { paypal: boolean; card: boolean; manual: boolean }
}

type Method = 'paypal' | 'card' | 'manual'

export default function Checkout() {
  const { checkoutProduct, setView } = useApp()
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [method, setMethod] = useState<Method>('manual')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<null | { orderId: string; amount: number; currency: string; method: string }>(null)

  useEffect(() => {
    fetch('/api/payment-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings
        setSettings(s)
        if (s.methods.paypal) setMethod('paypal')
        else if (s.methods.card) setMethod('card')
        else setMethod('manual')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!checkoutProduct && !success) {
      setView('home')
    }
  }, [checkoutProduct, success, setView])

  if (!checkoutProduct && !success) return null

  const price = checkoutProduct?.price ?? 0
  const tax = settings ? Math.round(price * settings.taxPercent) / 100 : 0
  const total = Math.round((price + tax) * 100) / 100

  const submit = async () => {
    if (!checkoutProduct) return
    if (method === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
        toast.error('يرجى ملء جميع بيانات البطاقة')
        return
      }
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: checkoutProduct.id,
          paymentMethod: method,
          customerName,
          customerEmail,
          notes: method === 'card' ? `**** **** **** ${cardNumber.slice(-4)}` : null,
        }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setSuccess({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
      })
      toast.success('تم إنشاء طلبك بنجاح')
    } catch {
      toast.error('فشل إنشاء الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-32 pb-20 sm:px-6 md:pt-40 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard strong className="overflow-hidden p-8 text-center md:p-12" glow>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00F5D4]/15"
            >
              <CheckCircle2 className="h-9 w-9 text-[#00F5D4]" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              تم استلام طلبك
            </h1>
            <p className="mt-3 text-sm text-white/60">
              رقم الطلب: <span className="font-mono text-[#00F5D4]">#{success.orderId.slice(-8).toUpperCase()}</span>
            </p>
            <p className="mt-2 text-sm text-white/60">
              المبلغ: <span className="font-bold text-white">${success.amount.toFixed(2)} {success.currency}</span> ·{' '}
              طريقة الدفع: <span className="text-white">{methodLabel(success.method)}</span>
            </p>
            <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-white/50">
              سيتم التواصل معك خلال 24 ساعة لتأكيد الدفع وتسليم المنتج داخل المدينة.
              للحصول على دعم سريع، افتح تذكرة في ديسكورد GenerationX.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <GlowButton
                variant="primary"
                size="md"
                glow
                onClick={() => {
                  setSuccess(null)
                  setView('home')
                }}
              >
                العودة للرئيسية
              </GlowButton>
              <GlowButton
                variant="outline"
                size="md"
                magnetic={false}
                onClick={() => {
                  setSuccess(null)
                  setView('home')
                  setTimeout(() => {
                    document.getElementById('store')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
              >
                متابعة التسوق
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  const product = checkoutProduct!
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6 md:pt-36 lg:px-8">
      <button
        onClick={() => setView('home')}
        data-cursor="hover"
        className="mb-6 flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمتجر
      </button>

      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">إتمام الشراء</h1>
      <p className="mt-2 text-sm text-white/55">
        راجع تفاصيل الطلب، اختر طريقة الدفع، وأكمل عملية الشراء بأمان.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h2 className="mb-4 text-sm font-bold text-white">معلومات العميل</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="الاسم الكامل">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="gx-input"
                  placeholder="اكتب اسمك"
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="gx-input"
                  placeholder="you@example.com"
                />
              </Field>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-4 text-sm font-bold text-white">طريقة الدفع</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <MethodOption
                icon={<Wallet size={16} />}
                label="PayPal"
                active={method === 'paypal'}
                disabled={!settings?.methods.paypal}
                onClick={() => setMethod('paypal')}
              />
              <MethodOption
                icon={<CreditCard size={16} />}
                label="Visa / Mastercard"
                active={method === 'card'}
                disabled={!settings?.methods.card}
                onClick={() => setMethod('card')}
              />
              <MethodOption
                icon={<Banknote size={16} />}
                label="تحويل بنكي"
                active={method === 'manual'}
                disabled={!settings?.methods.manual}
                onClick={() => setMethod('manual')}
              />
            </div>

            <AnimatePresence mode="wait">
              {method === 'paypal' && (
                <motion.div
                  key="paypal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-center"
                >
                  <p className="text-xs text-white/60">
                    سيتم تحويلك إلى PayPal لإتمام الدفع بعد تأكيد الطلب.
                  </p>
                </motion.div>
              )}

              {method === 'card' && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 space-y-3"
                >
                  <Field label="رقم البطاقة">
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="gx-input font-mono"
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      maxLength={19}
                    />
                  </Field>
                  <Field label="الاسم على البطاقة">
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="gx-input"
                      placeholder="JOHN DOE"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="تاريخ الانتهاء">
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="gx-input font-mono"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </Field>
                    <Field label="CVC">
                      <input
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="gx-input font-mono"
                        placeholder="123"
                        inputMode="numeric"
                        maxLength={4}
                      />
                    </Field>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                    <Lock size={11} />
                    معلوماتك محمية بتشفير SSL
                  </div>
                </motion.div>
              )}

              {method === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p className="text-xs leading-relaxed text-white/60">
                    بعد إتمام الطلب، سيتم التواصل معك عبر الديسكورد لتأكيد التحويل البنكي وتسليم المنتج.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        <div>
          <GlassCard strong className="sticky top-24 overflow-hidden p-5">
            <h2 className="mb-4 text-sm font-bold text-white">ملخص الطلب</h2>

            <div className="flex items-start gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30">
                { }
                <img
                  src={product.image || '/products/catalog-1.png'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-white">{product.name}</div>
                {product.category && (
                  <div className="mt-0.5 text-[11px] text-white/40">
                    {product.category.name}
                  </div>
                )}
                <div className="mt-1 text-sm font-bold text-[#00F5D4]">
                  ${product.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
              <Line label="السعر الفرعي" value={`$${price.toFixed(2)}`} />
              {settings && settings.taxPercent > 0 && (
                <Line
                  label={`ضريبة (${settings.taxPercent}%)`}
                  value={`$${tax.toFixed(2)}`}
                />
              )}
              <div className="my-2 h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">الإجمالي</span>
                <span className="text-xl font-extrabold text-[#00F5D4]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <GlowButton
              variant="primary"
              size="lg"
              glow
              className="mt-6 w-full"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  إتمام الشراء
                </>
              )}
            </GlowButton>
            <p className="mt-3 text-center text-[11px] text-white/40">
              بالضغط على "إتمام الشراء" أنت توافق على شروط الخدمة
            </p>
          </GlassCard>
        </div>
      </div>

      <style jsx global>{`
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
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/60">{label}</span>
      {children}
    </label>
  )
}

function MethodOption({
  icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-cursor="hover"
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
        disabled
          ? 'cursor-not-allowed border-white/[0.04] bg-white/[0.01] text-white/20'
          : active
          ? 'border-[#00F5D4] bg-[#00F5D4]/[0.08] text-[#00F5D4]'
          : 'border-white/[0.08] bg-white/[0.02] text-white/70 hover:border-[#00F5D4]/40'
      }`}
    >
      {icon}
      <span className="flex-1 text-right">{label}</span>
    </button>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/55">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}

function methodLabel(m: string) {
  if (m === 'paypal') return 'PayPal'
  if (m === 'card') return 'بطاقة'
  return 'تحويل بنكي'
}

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}
