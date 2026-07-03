import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * Aggregated stats for the admin dashboard home tile.
 */
export async function GET() {
  const user = await getSession()
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const [
    totalUsers,
    verifiedUsers,
    totalQuestions,
    enabledQuestions,
    totalResults,
    passedResults,
    categories,
    recentResults,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { verified: true } }),
    db.question.count(),
    db.question.count({ where: { enabled: true } }),
    db.examResult.count(),
    db.examResult.count({ where: { passed: true } }),
    db.category.count(),
    db.examResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: true },
    }),
  ])

  const passRate = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0

  return NextResponse.json({
    totalUsers,
    verifiedUsers,
    totalQuestions,
    enabledQuestions,
    totalResults,
    passedResults,
    failedResults: totalResults - passedResults,
    passRate,
    categories,
    recentResults: recentResults.map((r) => ({
      id: r.id,
      username: r.user.username,
      percentage: r.percentage,
      passed: r.passed,
      verified: r.user.verified,
      createdAt: r.createdAt,
    })),
  })
}
