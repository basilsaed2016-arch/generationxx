import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

type SubmitBody = {
  answers: Record<string, string> // questionId -> "A" | "B" | "C" | "D"
  durationSec: number
}

export async function POST(req: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as SubmitBody | null
  if (!body?.answers) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  const questions = await db.question.findMany({
    where: { enabled: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  let correctCount = 0
  const detailed: {
    questionId: string
    text: string
    correct: string
    user: string
    isCorrect: boolean
  }[] = []

  for (const q of questions) {
    const userAnswer = body.answers[q.id] ?? null
    const isCorrect = userAnswer === q.correct
    if (isCorrect) correctCount++
    detailed.push({
      questionId: q.id,
      text: q.text,
      correct: q.correct,
      user: userAnswer ?? '-',
      isCorrect,
    })
  }

  const total = questions.length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = percentage >= 80
  const durationSec = Math.max(0, Math.min(3600, Math.floor(body.durationSec ?? 0)))

  const result = await db.examResult.create({
    data: {
      userId: user.id,
      score: correctCount,
      total,
      percentage,
      passed,
      durationSec,
      answersJson: JSON.stringify(detailed),
    },
  })

  return NextResponse.json({
    resultId: result.id,
    score: correctCount,
    total,
    percentage,
    passed,
    durationSec,
    passThreshold: 80,
    detailed,
  })
}
