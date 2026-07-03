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
  const questions = await db.question.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { category: true },
  })
  return NextResponse.json({ questions })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const {
    text,
    optionA,
    optionB,
    optionC,
    optionD,
    correct,
    enabled = true,
    timeLimit = 60,
    explanation = null,
    categoryId = null,
  } = body

  if (!text || !optionA || !optionB || !optionC || !optionD) {
    return NextResponse.json(
      { error: 'missing_fields' },
      { status: 400 }
    )
  }

  const orderMax = await db.question.aggregate({ _max: { order: true } })
  const order = (orderMax._max.order ?? -1) + 1

  const question = await db.question.create({
    data: {
      text,
      optionA,
      optionB,
      optionC,
      optionD,
      correct: ['A', 'B', 'C', 'D'].includes(correct) ? correct : 'A',
      enabled: Boolean(enabled),
      timeLimit: Math.max(10, Math.min(600, Number(timeLimit) || 60)),
      explanation,
      categoryId: categoryId || null,
      order,
    },
  })
  return NextResponse.json({ question })
}
