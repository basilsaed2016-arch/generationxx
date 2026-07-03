import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.isAdmin) return null
  return user
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const products = await db.product.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { category: true },
  })
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const name: string = (body.name ?? '').toString().trim()
  const description: string | null = body.description ? String(body.description) : null
  const price = Number(body.price) || 0
  const currency: string = (body.currency ?? 'USD').toString()
  const image: string | null = body.image ? String(body.image) : null
  const badge: string | null = body.badge ? String(body.badge) : null
  const categoryId: string | null = body.categoryId || null
  const enabled = body.enabled !== false

  if (!name) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 })
  }

  const orderMax = await db.product.aggregate({ _max: { order: true } })
  const order = (orderMax._max.order ?? -1) + 1

  const product = await db.product.create({
    data: {
      name,
      description,
      price,
      currency,
      image,
      badge,
      categoryId,
      enabled,
      order,
    },
  })
  return NextResponse.json({ product })
}
