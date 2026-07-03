'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import GlassCard from '@/components/ui/GlassCard'
import { useApp } from '@/lib/store'

type Category = { id: string; name: string; slug: string }
type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image: string | null
  badge: string | null
  category: Category | null
}

export default function Store() {
  const { startCheckout } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSlug, setActiveSlug] = useState<string>('all')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? [])
        setCategories(d.categories ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (activeSlug === 'all') return products
    return products.filter((p) => p.category?.slug === activeSlug)
  }, [products, activeSlug])

  return (
    <section
      id="store"
      className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8"
    >
      <SectionHeading
        eyebrow="المتجر"
        title="متجر GenerationX الرسمي"
        subtitle="منتجات حصرية تفتح لك أبواباً جديدة داخل المدينة. سيارات، شخصيات، عقارات، أسلحة، وباقات VIP فاخرة."
      />

      {/* Category filter */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <CategoryChip
          label="الكل"
          active={activeSlug === 'all'}
          onClick={() => setActiveSlug('all')}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.name}
            active={activeSlug === c.slug}
            onClick={() => setActiveSlug(c.slug)}
          />
        ))}
      </div>

      {/* Products grid */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] animate-pulse rounded-xl bg-white/[0.03]"
              />
            ))
          : filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <ProductCard product={p} onBuy={() => startCheckout(p)} />
              </motion.div>
            ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="mt-10 text-center text-white/40">
          لا توجد منتجات في هذا التصنيف حالياً.
        </div>
      )}

      {/* Trust strip */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <Check size={13} className="text-[#00F5D4]" /> دفع آمن ومشفّر
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={13} className="text-[#00F5D4]" /> تسليم فوري داخل المدينة
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={13} className="text-[#00F5D4]" /> دعم على مدار الساعة
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={13} className="text-[#00F5D4]" /> ضمان استرجاع خلال 24 ساعة
        </span>
      </div>
    </section>
  )
}

function CategoryChip({
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
      className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'border-[#00F5D4] bg-[#00F5D4] text-[#050505]'
          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-[#00F5D4]/40 hover:text-[#00F5D4]'
      }`}
    >
      {label}
    </button>
  )
}

function ProductCard({
  product,
  onBuy,
}: {
  product: Product
  onBuy: () => void
}) {
  const imageUrl = product.image || '/products/catalog-1.png'
  return (
    <GlassCard
      className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00F5D4]/40"
      data-cursor="hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/30">
        { }
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,11,14,0.95), transparent 60%)',
          }}
        />
        {/* Badge */}
        {product.badge && (
          <div className="absolute right-3 top-3 rounded-full border border-[#00F5D4]/40 bg-[#050505]/80 px-2.5 py-0.5 text-[10px] font-bold text-[#00F5D4] backdrop-blur-sm">
            {product.badge}
          </div>
        )}
        {/* Category tag */}
        {product.category && (
          <div className="absolute left-3 top-3 rounded-full bg-[#050505]/80 px-2.5 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
            {product.category.name}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">
            {product.description}
          </p>
        )}

        {/* Price + buy */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <div className="text-2xl font-extrabold text-white">
              ${product.price.toFixed(2)}
            </div>
            <div className="text-[10px] text-white/40">{product.currency}</div>
          </div>
          <button
            onClick={onBuy}
            data-cursor="hover"
            className="rounded-lg bg-[#00F5D4] px-4 py-2 text-sm font-bold text-[#050505] transition-all hover:bg-[#00d4b8] hover:gx-glow-sm"
          >
            شراء الآن
          </button>
        </div>
      </div>
    </GlassCard>
  )
}
