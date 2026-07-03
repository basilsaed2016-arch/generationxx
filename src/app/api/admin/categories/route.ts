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
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { questions: true } } },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const name: string = (body.name ?? '').toString().trim()
  const color: string = (body.color ?? '#00F5D4').toString()

  if (!name) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 })
  }

  const orderMax = await db.category.aggregate({ _max: { order: true } })
  const order = (orderMax._max.order ?? -1) + 1

  try {
    const category = await db.category.create({
      data: { name, color, order },
    })
    return NextResponse.json({ category })
  } catch {
    return NextResponse.json(
      { error: 'name_exists' },
      { status: 409 }
    )
  }
}
