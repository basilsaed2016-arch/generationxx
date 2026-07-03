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
  const categories = await db.productCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const name: string = (body.name ?? '').toString().trim()
  const slug: string = (body.slug ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const order = Number(body.order) || 0

  if (!name || !slug) {
    return NextResponse.json({ error: 'name_and_slug_required' }, { status: 400 })
  }

  try {
    const category = await db.productCategory.create({ data: { name, slug, order } })
    return NextResponse.json({ category })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'slug_exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'create_failed' }, { status: 500 })
  }
}
