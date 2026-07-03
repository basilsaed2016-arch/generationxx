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
  const streamers = await db.streamer.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json({ streamers })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const name: string = (body.name ?? '').toString().trim()
  const kickUrl: string = (body.kickUrl ?? '').toString().trim()
  const description: string | null = body.description ? String(body.description) : null
  const avatar: string | null = body.avatar ? String(body.avatar) : null
  const enabled = body.enabled !== false
  const order = Number(body.order) || 0

  if (!name || !kickUrl) {
    return NextResponse.json(
      { error: 'name_and_kick_url_required' },
      { status: 400 }
    )
  }

  // Extract slug from URL: kick.com/{slug}
  const slugMatch = kickUrl.match(/kick\.com\/([^/?#]+)/i)
  const kickSlug = slugMatch ? slugMatch[1] : kickUrl

  if (!kickSlug) {
    return NextResponse.json({ error: 'invalid_kick_url' }, { status: 400 })
  }

  try {
    const streamer = await db.streamer.create({
      data: {
        name,
        kickSlug,
        kickUrl: kickUrl.startsWith('http') ? kickUrl : `https://kick.com/${kickSlug}`,
        description,
        avatar,
        enabled,
        order,
      },
    })
    return NextResponse.json({ streamer })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'slug_exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'create_failed' }, { status: 500 })
  }
}
