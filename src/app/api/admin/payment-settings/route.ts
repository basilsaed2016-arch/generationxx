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
  const settings = (await db.paymentSettings.findUnique({ where: { id: 'default' } })) ?? null
  return NextResponse.json({ settings })
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))

  const data = {
    paypalEmail: body.paypalEmail ?? null,
    bankName: body.bankName ?? null,
    bankAccountName: body.bankAccountName ?? null,
    bankAccountNumber: body.bankAccountNumber ?? null,
    bankIban: body.bankIban ?? null,
    bankSwift: body.bankSwift ?? null,
    cardProvider: body.cardProvider ?? 'stripe',
    cardProviderKey: body.cardProviderKey ?? null,
    currency: body.currency ?? 'USD',
    taxPercent: Number(body.taxPercent) || 0,
    enabled: body.enabled !== false,
  }

  const settings = await db.paymentSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  })
  return NextResponse.json({ settings })
}
