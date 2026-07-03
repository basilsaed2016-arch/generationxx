import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.isAdmin) return null
  return user
}

/**
 * GET /api/admin/results?q=&status=&page=&limit=
 * Returns paginated exam results with user info.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? '' // 'pass' | 'fail'
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') ?? '20')))

  const where = {
    ...(status === 'pass' ? { passed: true } : status === 'fail' ? { passed: false } : {}),
    ...(q
      ? {
          user: {
            OR: [
              { username: { contains: q } },
              { discordId: { contains: q } },
            ],
          },
        }
      : {}),
  }

  const [results, total] = await Promise.all([
    db.examResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true },
    }),
    db.examResult.count({ where }),
  ])

  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      score: r.score,
      total: r.total,
      percentage: r.percentage,
      passed: r.passed,
      durationSec: r.durationSec,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        username: r.user.username,
        discordId: r.user.discordId,
        avatar: r.user.avatar,
      },
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}

/**
 * Export all results as JSON (downloadable).
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  if (searchParams.get('export') !== '1') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const results = await db.examResult.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })

  const rows = results.map((r) => ({
    id: r.id,
    username: r.user.username,
    discordId: r.user.discordId,
    score: r.score,
    total: r.total,
    percentage: r.percentage,
    passed: r.passed ? 'PASS' : 'FAIL',
    durationSec: r.durationSec,
    createdAt: r.createdAt.toISOString(),
  }))

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    total: rows.length,
    results: rows,
  })
}
