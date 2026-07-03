import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.isAdmin) return null
  return user
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const allowed: Record<string, unknown> = {}
  for (const key of ['name', 'description', 'image', 'badge']) {
    if (key in body) allowed[key] = body[key] === '' ? null : body[key]
  }
  if ('price' in body) allowed.price = Number(body.price) || 0
  if ('currency' in body) allowed.currency = String(body.currency)
  if ('enabled' in body) allowed.enabled = Boolean(body.enabled)
  if ('order' in body) allowed.order = Number(body.order) || 0
  if ('categoryId' in body) {
    allowed.categoryId = body.categoryId === '' || body.categoryId === null ? null : body.categoryId
  }

  try {
    const product = await db.product.update({ where: { id }, data: allowed })
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { id } = await params
  await db.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
