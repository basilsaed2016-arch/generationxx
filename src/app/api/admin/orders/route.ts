import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.isAdmin) return null
  return user
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') ?? '20')))

  const where = status ? { status } : {}
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({
    orders,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, status } = body
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })
  if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  }
  const order = await db.order.update({ where: { id }, data: { status } })
  return NextResponse.json({ order })
}
