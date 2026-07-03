import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Public live-status proxy.
 *
 * Forwards to the kick-live-status mini-service on port 3030 (via XTransformPort).
 * Falls back to an empty list if the service is unavailable.
 */
export async function GET() {
  try {
    const res = await fetch('http://localhost:3030/status', {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) throw new Error('bad_status')
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ streamers: [], offline: true })
  }
}
