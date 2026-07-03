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
  for (const key of [
    'text',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'correct',
    'explanation',
  ]) {
    if (key in body) allowed[key] = body[key]
  }
  if ('enabled' in body) allowed.enabled = Boolean(body.enabled)
  if ('timeLimit' in body) {
    allowed.timeLimit = Math.max(10, Math.min(600, Number(body.timeLimit) || 60))
  }
  if ('order' in body) allowed.order = Number(body.order) || 0
  if ('categoryId' in body) {
    allowed.categoryId = body.categoryId === '' ? null : body.categoryId
  }

  const question = await db.question.update({
    where: { id },
    data: allowed,
  })
  return NextResponse.json({ question })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { id } = await params
  await db.question.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
