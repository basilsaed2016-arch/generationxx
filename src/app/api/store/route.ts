import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const items = await db.storeItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  const payload = items.map((it) => ({
    id: it.id,
    name: it.name,
    tier: it.tier,
    price: it.price,
    currency: it.currency,
    color: it.color,
    badge: it.badge,
    features: JSON.parse(it.featuresJson || '[]') as string[],
  }))
  return NextResponse.json({ items: payload })
}
