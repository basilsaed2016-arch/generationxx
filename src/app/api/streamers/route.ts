import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public streamers list (with live status from DB cache populated by the
 * kick-live-status mini-service on port 3030).
 */
export async function GET() {
  const streamers = await db.streamer.findMany({
    where: { enabled: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  const payload = streamers.map((s) => ({
    id: s.id,
    name: s.name,
    kickSlug: s.kickSlug,
    kickUrl: s.kickUrl,
    avatar: s.avatar,
    description: s.description,
    order: s.order,
    enabled: s.enabled,
    isLive: s.isLive,
    liveTitle: s.liveTitle,
    liveViewerCount: s.liveViewerCount,
    liveCheckedAt: s.liveCheckedAt,
  }))

  return NextResponse.json({ streamers: payload })
}
