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
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') ?? '20')))

  const where = q
    ? {
        OR: [
          { username: { contains: q } },
          { discordId: { contains: q } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { examResults: true } },
        examResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { percentage: true, passed: true, createdAt: true },
        },
      },
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      discordId: u.discordId,
      avatar: u.avatar,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      examCount: u._count.examResults,
      lastExam: u.examResults[0] ?? null,
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}

/**
 * Promote / demote admin
 */
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, isAdmin } = body
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

  const user = await db.user.update({
    where: { id },
    data: { isAdmin: Boolean(isAdmin) },
  })
  return NextResponse.json({ user: { id: user.id, isAdmin: user.isAdmin } })
}
