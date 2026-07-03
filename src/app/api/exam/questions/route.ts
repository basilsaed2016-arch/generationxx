import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * Returns the active exam questions for the current user.
 * Hides the correct answers — client only knows the options.
 */
export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const questions = await db.question.findMany({
    where: { enabled: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { category: true },
  })

  const payload = questions.map((q, idx) => ({
    id: q.id,
    index: idx + 1,
    text: q.text,
    options: {
      A: q.optionA,
      B: q.optionB,
      C: q.optionC,
      D: q.optionD,
    },
    timeLimit: q.timeLimit,
    category: q.category?.name ?? 'عام',
    categoryId: q.categoryId,
    explanation: q.explanation ?? null,
  }))

  return NextResponse.json({
    total: payload.length,
    passThreshold: 80,
    questions: payload,
  })
}
