import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public payment settings (limited fields — no secrets).
 * Used by the checkout page to display currency, accepted methods, and tax.
 */
export async function GET() {
  const s = await db.paymentSettings.findUnique({ where: { id: 'default' } })
  if (!s) {
    return NextResponse.json({
      settings: {
        currency: 'USD',
        taxPercent: 0,
        enabled: false,
        methods: {
          paypal: false,
          card: false,
          manual: true,
        },
      },
    })
  }
  return NextResponse.json({
    settings: {
      currency: s.currency,
      taxPercent: s.taxPercent,
      enabled: s.enabled,
      methods: {
        paypal: Boolean(s.paypalEmail),
        card: Boolean(s.cardProviderKey),
        manual: true,
      },
    },
  })
}
