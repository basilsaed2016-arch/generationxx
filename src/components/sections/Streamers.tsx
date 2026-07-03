'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Users } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import GlassCard from '@/components/ui/GlassCard'
import KickIcon from '@/components/ui/KickIcon'

type Streamer = {
  id: string
  name: string
  kickSlug: string
  kickUrl: string
  avatar: string | null
  description: string | null
  isLive: boolean
  liveTitle: string | null
  liveViewerCount: number | null
  liveCheckedAt: string | null
}

export default function Streamers() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/streamers', { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return
        setStreamers(data.streamers ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    // Refresh live status from the live-status service every 60s
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/live-status', { cache: 'no-store' })
        const data = await res.json()
        if (!data?.streamers?.length) return
        const map = new Map<string, { isLive: boolean; liveTitle: string | null; liveViewerCount: number | null }>(
          data.streamers.map((s: any) => [s.kickSlug, s])
        )
        setStreamers((prev) =>
          prev.map((s) => {
            const fresh = map.get(s.kickSlug)
            if (!fresh) return s
            return {
              ...s,
              isLive: fresh.isLive,
              liveTitle: fresh.liveTitle,
              liveViewerCount: fresh.liveViewerCount,
            }
          })
        )
      } catch {
        /* ignore */
      }
    }, 60_000)

    return () => {
      cancelled = true
      clearInterval(poll)
    }
  }, [])

  const openKick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section
      id="streamers"
      className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8"
    >
      <SectionHeading
        eyebrow="الستريمرز"
        title="نجوم GenerationX على Kick"
        subtitle="صناع المحتوى الذين ينقلون تجربة المدينة إلى جمهورهم مباشرةً على منصة Kick. اضغط على أي بطاقة لمتابعة البث."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-xl bg-white/[0.03]"
              />
            ))
          : streamers.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <StreamerCard streamer={s} onClick={() => openKick(s.kickUrl)} />
              </motion.div>
            ))}
      </div>
    </section>
  )
}

function StreamerCard({
  streamer,
  onClick,
}: {
  streamer: Streamer
  onClick: () => void
}) {
  const live = streamer.isLive
  // Avatar fallback: use Kick avatar URL pattern if not set, else dicebear identicon from slug
  const avatarUrl =
    streamer.avatar ||
    `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(streamer.kickSlug)}&backgroundColor=090909`

  return (
    <GlassCard
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`group h-full cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00F5D4]/40 ${
        live ? 'gx-glow-sm' : ''
      }`}
      data-cursor="hover"
    >
      {/* Header: avatar + name + kick icon */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          {/* Avatar with ring (cyan when live) */}
          <div
            className={`relative h-16 w-16 overflow-hidden rounded-full ring-2 ${
              live ? 'ring-[#00F5D4]' : 'ring-white/10'
            }`}
          >
            { }
            <img
              src={avatarUrl}
              alt={streamer.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Live pulsing dot */}
          {live && (
            <span className="absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00F5D4] opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00F5D4]" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-white">
            {streamer.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
            <KickIcon className="h-3.5 w-3.5" />
            <span className="truncate">kick.com/{streamer.kickSlug}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {streamer.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/55">
          {streamer.description}
        </p>
      )}

      {/* Live status badge */}
      <div className="mt-4 flex items-center justify-between">
        {live ? (
          <div className="flex items-center gap-2 rounded-full border border-[#00F5D4]/40 bg-[#00F5D4]/[0.08] px-3 py-1 text-xs font-bold text-[#00F5D4]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00F5D4] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00F5D4]" />
            </span>
            LIVE NOW
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/40">
            <span className="inline-block h-2 w-2 rounded-full bg-white/30" />
            OFFLINE
          </div>
        )}

        {live && streamer.liveViewerCount != null && (
          <div className="flex items-center gap-1 text-xs text-white/50">
            <Users size={12} />
            {streamer.liveViewerCount.toLocaleString('en-US')}
          </div>
        )}
      </div>

      {/* Live title (only when live) */}
      {live && streamer.liveTitle && (
        <div className="mt-3 truncate rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2 text-xs text-white/60">
          {streamer.liveTitle}
        </div>
      )}

      {/* Watch button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        data-cursor="hover"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#00F5D4]/30 bg-[#00F5D4]/[0.06] py-2.5 text-sm font-bold text-[#00F5D4] transition-colors hover:bg-[#00F5D4]/[0.12] hover:border-[#00F5D4]/50"
      >
        <KickIcon className="h-4 w-4" />
        Watch Stream
        <ExternalLink size={12} className="opacity-60" />
      </button>
    </GlassCard>
  )
}
