'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
  ListChecks,
  AlertTriangle,
  Home,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import GlowButton from '@/components/ui/GlowButton'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from 'sonner'

type Question = {
  id: string
  index: number
  text: string
  options: { A: string; B: string; C: string; D: string }
  timeLimit: number
  category: string
  categoryId: string | null
  explanation: string | null
}

type ExamResult = {
  resultId: string
  score: number
  total: number
  percentage: number
  passed: boolean
  durationSec: number
  passThreshold: number
  detailed: {
    questionId: string
    text: string
    correct: string
    user: string
    isCorrect: boolean
  }[]
}

type Phase = 'intro' | 'exam' | 'submitting' | 'result'

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function Exam() {
  const { user, setView } = useApp()
  const [phase, setPhase] = useState<Phase>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/exam/questions', { cache: 'no-store' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      if (!data.questions?.length) {
        toast.error('لا توجد أسئلة مفعّلة حالياً. حاول لاحقاً.')
        return
      }
      setQuestions(data.questions)
      setTimeLeft(data.questions[0].timeLimit)
      setAnswers({})
      setCurrent(0)
    } catch {
      toast.error('تعذّر تحميل الأسئلة')
    } finally {
      setLoading(false)
    }
  }, [])

  const startExam = async () => {
    await loadQuestions()
    if (questions.length === 0) return
    setPhase('exam')
    startTimeRef.current = performance.now()
  }

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return
    const q = questions[current]
    if (!q) return
    setTimeLeft(q.timeLimit)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Auto-advance
          if (current < questions.length - 1) {
            setCurrent((c) => c + 1)
          } else {
            submitExam()
          }
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
     
  }, [phase, current, questions])

  const pickAnswer = (letter: string) => {
    const q = questions[current]
    if (!q) return
    setAnswers((a) => ({ ...a, [q.id]: letter }))
    // Auto-advance after slight delay
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent((c) => c + 1)
      }
    }, 250)
  }

  const goNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1)
  }
  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1)
  }

  const submitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('submitting')
    const durationSec = Math.round((performance.now() - startTimeRef.current) / 1000)
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, durationSec }),
      })
      if (!res.ok) throw new Error('submit_failed')
      const data = (await res.json()) as ExamResult
      setResult(data)
      setPhase('result')
      if (data.passed) {
        toast.success('مبروك! اجتزت الاختبار')
      } else {
        toast.error('لم تصل للنسبة المطلوبة')
      }
    } catch {
      toast.error('فشل إرسال النتائج')
      setPhase('exam')
    }
  }

  const restart = () => {
    setResult(null)
    setPhase('intro')
    setQuestions([])
    setAnswers({})
    setCurrent(0)
  }

  // ---------- INTRO ----------
  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6 md:pt-40 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard strong className="overflow-hidden p-8 md:p-12" glow>
            <div
              className="pointer-events-none absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(0,245,212,0.35), transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00F5D4]/30 bg-[#00F5D4]/5 px-4 py-1.5 text-xs font-semibold text-[#00F5D4]">
                <ListChecks size={14} />
                الاختبار الإلكتروني
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
                الاختبار الإلكتروني
              </h1>
              <p className="mt-4 text-base text-white/70 md:text-lg">
                قم بالإجابة على جميع الأسئلة للتقديم على تفعيل شخصيتك داخل المدينة.
                الاختبار يقيس فهمك لقواعد الرول بلاي وقوانين GenerationX.
              </p>

              {/* Info grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoTile label="عدد الأسئلة" value="20" />
                <InfoTile label="نسبة النجاح" value="80%" />
                <InfoTile label="الوقت/سؤال" value="60 ثانية" />
                <InfoTile label="المحاولات" value="غير محدودة" />
              </div>

              {/* Rules */}
              <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-amber-300">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-bold">تنبيهات مهمة</span>
                </div>
                <ul className="space-y-1.5 text-xs text-white/70 sm:text-sm">
                  <li>• يجب الإجابة على جميع الأسئلة، الإجابات الفارغة تُحتسب خاطئة.</li>
                  <li>• لا يمكن الرجوع لتعديل إجابة بعد الانتقال للسؤال التالي.</li>
                  <li>• ينتهي السؤال تلقائياً عند انتهاء الوقت.</li>
                  <li>• يتم حفظ نتيجتك في قاعدة البيانات بشكل دائم.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <GlowButton
                  variant="primary"
                  size="lg"
                  glow
                  onClick={startExam}
                  disabled={loading}
                >
                  <Trophy className="h-5 w-5" />
                  {loading ? 'جاري التحميل...' : 'ابدأ الاختبار'}
                </GlowButton>
                <GlowButton
                  variant="ghost"
                  size="lg"
                  magnetic={false}
                  onClick={() => setView('home')}
                >
                  <Home className="h-5 w-5" />
                  العودة للرئيسية
                </GlowButton>
              </div>

              {/* User chip */}
              {user && (
                <p className="mt-6 text-center text-xs text-white/50">
                  مسجّل الدخول باسم:{' '}
                  <span className="font-semibold text-[#00F5D4]">{user.username}</span>
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  // ---------- SUBMITTING ----------
  if (phase === 'submitting') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#00F5D4] border-t-transparent" />
        <p className="text-white/70">جاري احتساب نتيجتك...</p>
      </div>
    )
  }

  // ---------- RESULT ----------
  if (phase === 'result' && result) {
    return (
      <ExamResultView result={result} onRestart={restart} onHome={() => setView('home')} />
    )
  }

  // ---------- EXAM ----------
  const q = questions[current]
  if (!q) return null
  const answered = answers[q.id]
  const progress = ((current + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const timePct = (timeLeft / q.timeLimit) * 100

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6 md:pt-36 lg:px-8">
      {/* Top bar: progress + timer */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-white/60">
          <span>
            السؤال {q.index} من {questions.length}
          </span>
          <span>
            تمت الإجابة: {answeredCount} / {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-[#00F5D4] to-[#5b8cff]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard strong className="overflow-hidden p-6 md:p-8" glow>
            {/* Category + timer */}
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full border border-[#00F5D4]/30 bg-[#00F5D4]/5 px-3 py-1 text-xs font-semibold text-[#00F5D4]">
                {q.category}
              </span>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#00F5D4]" />
                <span
                  className={`font-mono text-sm font-bold ${
                    timeLeft <= 10 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>
            {/* Timer bar */}
            <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 10 ? 'bg-rose-500' : 'bg-[#00F5D4]'
                }`}
                style={{ width: `${timePct}%` }}
              />
            </div>

            {/* Question */}
            <h2 className="mb-6 text-xl font-bold leading-relaxed text-white md:text-2xl">
              {q.text}
            </h2>

            {/* Options */}
            <div className="grid gap-3">
              {LETTERS.map((letter) => {
                const isPicked = answered === letter
                return (
                  <motion.button
                    key={letter}
                    onClick={() => pickAnswer(letter)}
                    data-cursor="hover"
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center gap-4 rounded-xl border p-4 text-right transition-all ${
                      isPicked
                        ? 'border-[#00F5D4] bg-[#00F5D4]/10 gx-glow-sm'
                        : 'border-white/10 bg-white/[0.02] hover:border-[#00F5D4]/50 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        isPicked
                          ? 'bg-[#00F5D4] text-[#050505]'
                          : 'bg-white/5 text-white/60 group-hover:bg-[#00F5D4]/20 group-hover:text-[#00F5D4]'
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`flex-1 text-sm md:text-base ${
                        isPicked ? 'font-semibold text-white' : 'text-white/80'
                      }`}
                    >
                      {q.options[letter]}
                    </span>
                    {isPicked && (
                      <CheckCircle2 className="h-5 w-5 text-[#00F5D4]" />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Nav buttons */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <GlowButton
                variant="ghost"
                size="sm"
                magnetic={false}
                onClick={goPrev}
                disabled={current === 0}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </GlowButton>

              {current === questions.length - 1 ? (
                <GlowButton
                  variant="primary"
                  size="sm"
                  glow
                  onClick={submitExam}
                  disabled={answeredCount === 0}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  إنهاء الاختبار
                </GlowButton>
              ) : (
                <GlowButton
                  variant="primary"
                  size="sm"
                  magnetic={false}
                  onClick={goNext}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </GlowButton>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Bottom: question grid for jump */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {questions.map((qq, i) => {
          const isAnswered = !!answers[qq.id]
          const isCurrent = i === current
          return (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              data-cursor="hover"
              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-[#00F5D4] text-[#050505] gx-glow-sm'
                  : isAnswered
                  ? 'bg-[#00F5D4]/20 text-[#00F5D4]'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
              title={`السؤال ${i + 1}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <div className="text-lg font-extrabold text-[#00F5D4]">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/50">{label}</div>
    </div>
  )
}

function ExamResultView({
  result,
  onRestart,
  onHome,
}: {
  result: ExamResult
  onRestart: () => void
  onHome: () => void
}) {
  const passed = result.passed
  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6 md:pt-40 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <GlassCard strong glow className="overflow-hidden p-8 text-center md:p-12">
          {/* Glow */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2"
            style={{
              background: passed
                ? 'radial-gradient(circle, rgba(0,245,212,0.45), transparent 70%)'
                : 'radial-gradient(circle, rgba(255,71,87,0.45), transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={`relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
              passed ? 'bg-[#00F5D4]/20' : 'bg-rose-500/20'
            }`}
          >
            {passed ? (
              <Trophy className="h-12 w-12 text-[#00F5D4]" />
            ) : (
              <XCircle className="h-12 w-12 text-rose-400" />
            )}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px solid',
                borderColor: passed ? '#00F5D4' : '#ff4757',
              }}
              animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          <h1 className="relative text-3xl font-extrabold text-white sm:text-4xl">
            {passed ? '🎉 مبروك، لقد اجتزت الاختبار' : 'للأسف لم تحقق النسبة المطلوبة'}
          </h1>
          <p className="relative mt-2 text-white/60">
            {passed
              ? 'يمكنك الآن التقديم على تفعيل شخصيتك داخل المدينة عبر فتح تذكرة في ديسكورد.'
              : 'لا تقلق، يمكنك إعادة المحاولة في أي وقت. راجع القوانين وأعد المحاولة.'}
          </p>

          {/* Score ring */}
          <div className="relative mx-auto mt-8 flex max-w-md items-center justify-around">
            <ScoreBlock label="الإجابات الصحيحة" value={`${result.score} / ${result.total}`} color="#00F5D4" />
            <ScoreBlock
              label="النسبة"
              value={`${result.percentage}%`}
              color={passed ? '#00F5D4' : '#ff4757'}
              big
            />
            <ScoreBlock label="الوقت المستغرق" value={`${Math.floor(result.durationSec / 60)}:${(result.durationSec % 60).toString().padStart(2, '0')}`} color="#5b8cff" />
          </div>

          {/* Pass threshold */}
          <p className="relative mt-6 text-sm text-white/50">
            نسبة النجاح المطلوبة: <span className="font-bold text-white">{result.passThreshold}%</span>
          </p>

          {/* Detailed answers */}
          <details className="relative mt-8 text-right">
            <summary className="cursor-pointer text-sm font-semibold text-[#00F5D4] hover:underline">
              عرض مراجعة الإجابات
            </summary>
            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-4">
              {result.detailed.map((d, i) => (
                <div
                  key={d.questionId}
                  className={`rounded-lg border p-3 text-sm ${
                    d.isCorrect
                      ? 'border-[#00F5D4]/20 bg-[#00F5D4]/5'
                      : 'border-rose-500/20 bg-rose-500/5'
                  }`}
                >
                  <div className="mb-1 flex items-start gap-2">
                    <span className="font-bold text-white/70">{i + 1}.</span>
                    <span className="flex-1 text-white/80">{d.text}</span>
                    {d.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00F5D4]" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-white/60">
                      إجابتك: <span className="font-bold text-white">{d.user === '-' ? 'لم تُجب' : d.user}</span>
                    </span>
                    {!d.isCorrect && (
                      <span className="text-[#00F5D4]">
                        الإجابة الصحيحة: <span className="font-bold">{d.correct}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <GlowButton variant="primary" size="lg" glow onClick={onRestart}>
              <RefreshCw className="h-5 w-5" />
              إعادة الاختبار
            </GlowButton>
            <GlowButton variant="ghost" size="lg" magnetic={false} onClick={onHome}>
              <Home className="h-5 w-5" />
              العودة للرئيسية
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

function ScoreBlock({
  label,
  value,
  color,
  big,
}: {
  label: string
  value: string
  color: string
  big?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`font-extrabold ${big ? 'text-4xl' : 'text-2xl'}`}
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-white/50">{label}</div>
    </div>
  )
}
