import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public products list (only enabled), grouped by category.
 */
export async function GET() {
  const products = await db.product.findMany({
    where: { enabled: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { category: true },
  })

  const categories = await db.productCategory.findMany({
    orderBy: { order: 'asc' },
  })

  const payload = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    image: p.image,
    badge: p.badge,
    order: p.order,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
  }))

  return NextResponse.json({
    products: payload,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
    })),
  })
}
