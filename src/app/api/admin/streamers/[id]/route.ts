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
  for (const key of ['name', 'description', 'avatar']) {
    if (key in body) allowed[key] = body[key] === '' ? null : body[key]
  }
  if ('enabled' in body) allowed.enabled = Boolean(body.enabled)
  if ('order' in body) allowed.order = Number(body.order) || 0
  if ('kickUrl' in body) {
    const url: string = String(body.kickUrl).trim()
    allowed.kickUrl = url.startsWith('http') ? url : `https://kick.com/${url}`
    const m = (allowed.kickUrl as string).match(/kick\.com\/([^/?#]+)/i)
    if (m) allowed.kickSlug = m[1]
  }

  try {
    const streamer = await db.streamer.update({ where: { id }, data: allowed })
    return NextResponse.json({ streamer })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'slug_exists' }, { status: 409 })
    }
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
  await db.streamer.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
