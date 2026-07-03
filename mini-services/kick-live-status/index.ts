/**
 * Kick Live Status — mini-service
 *
 * - Polls every active streamer's Kick channel every 60 seconds
 * - Updates the `Streamer` table with isLive / liveTitle / liveViewerCount / liveCheckedAt
 * - Exposes a tiny HTTP API on port 3030:
 *     GET /status        -> { streamers: [{ kickSlug, isLive, liveTitle, liveViewerCount, liveCheckedAt }] }
 *     GET /status/:slug  -> single streamer
 *
 * Kick public endpoints used:
 *   - https://kick.com/api/v2/channels/{slug}  -> { livetream: { is_live, session_title, viewer_count }, ... }
 *
 * Note: Kick sometimes rate-limits unauthenticated requests. We:
 *   - Use a 5s per-request timeout
 *   - Spread polls evenly (delay between each streamer request)
 *   - Cache results in DB so frontend always reads fresh state
 */

import { PrismaClient } from '@prisma/client'
import { createServer } from 'http'

const db = new PrismaClient()
const PORT = 3030
const POLL_INTERVAL_MS = 60_000
const REQUEST_TIMEOUT_MS = 6_000
const PER_REQUEST_DELAY_MS = 800 // spread out requests

type CachedStatus = {
  kickSlug: string
  isLive: boolean
  liveTitle: string | null
  liveViewerCount: number | null
  liveCheckedAt: string | null
}

// In-memory cache for fast HTTP responses (refreshed each poll cycle)
let cache: Map<string, CachedStatus> = new Map()

async function fetchKickChannel(slug: string): Promise<{
  isLive: boolean
  title: string | null
  viewers: number | null
} | null> {
  const url = `https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GenerationX-LiveStatus/1.0 (+https://generationx.gg)',
      },
    })
    if (!res.ok) {
      return null
    }
    const data: any = await res.json()
    const live = data?.livestream
    return {
      isLive: Boolean(live?.is_live),
      title: live?.session_title ?? null,
      viewers: typeof live?.viewer_count === 'number' ? live.viewer_count : null,
    }
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

async function pollOnce() {
  const streamers = await db.streamer.findMany({ where: { enabled: true } })
  const newCache = new Map<string, CachedStatus>()

  for (const s of streamers) {
    const fetched = await fetchKickChannel(s.kickSlug)
    const isLive = fetched?.isLive ?? false
    const title = fetched?.title ?? null
    const viewers = fetched?.viewers ?? null
    const now = new Date()

    try {
      await db.streamer.update({
        where: { id: s.id },
        data: {
          isLive,
          liveTitle: title,
          liveViewerCount: viewers,
          liveCheckedAt: now,
        },
      })
    } catch (e) {
      // ignore DB errors transiently
    }

    newCache.set(s.kickSlug, {
      kickSlug: s.kickSlug,
      isLive,
      liveTitle: title,
      liveViewerCount: viewers,
      liveCheckedAt: now.toISOString(),
    })

    // small delay between requests to be nice to Kick
    await new Promise((r) => setTimeout(r, PER_REQUEST_DELAY_MS))
  }

  cache = newCache
  const liveCount = Array.from(newCache.values()).filter((s) => s.isLive).length
  console.log(`[${new Date().toISOString()}] Polled ${streamers.length} streamers — ${liveCount} live`)
}

function startPolling() {
  // Poll immediately, then on interval
  pollOnce().catch((e) => console.error('poll error:', e?.message ?? e))
  setInterval(() => {
    pollOnce().catch((e) => console.error('poll error:', e?.message ?? e))
  }, POLL_INTERVAL_MS)
}

// ===== HTTP server =====
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const path = url.pathname

  if (path === '/health') {
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true, service: 'kick-live-status', port: PORT }))
    return
  }

  if (path === '/status') {
    const all = Array.from(cache.values())
    res.writeHead(200)
    res.end(JSON.stringify({ streamers: all, polledAt: new Date().toISOString() }))
    return
  }

  // /status/:slug
  const m = path.match(/^\/status\/([^/]+)$/)
  if (m) {
    const slug = decodeURIComponent(m[1])
    const s = cache.get(slug)
    if (!s) {
      res.writeHead(404)
      res.end(JSON.stringify({ error: 'not_found' }))
      return
    }
    res.writeHead(200)
    res.end(JSON.stringify(s))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'not_found' }))
})

server.listen(PORT, () => {
  console.log(`Kick Live Status service on http://localhost:${PORT}`)
  startPolling()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close()
  db.$disconnect()
  process.exit(0)
})
process.on('SIGINT', () => {
  server.close()
  db.$disconnect()
  process.exit(0)
})
