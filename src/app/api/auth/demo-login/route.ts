import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isDiscordConfigured, upsertUserFromDiscord, setSession } from '@/lib/auth'

/**
 * Demo login route — ONLY available when Discord OAuth is NOT configured.
 *
 * This exists purely for local development/testing without setting up
 * a Discord application. In production (with DISCORD_CLIENT_ID set),
 * this route returns 400 and users must use real Discord OAuth.
 *
 * Demo users are always marked as unverified (inGuild=false, verified=false).
 */
export async function POST(req: Request) {
  if (isDiscordConfigured()) {
    return NextResponse.json(
      { error: 'discord_configured_use_oauth' },
      { status: 400 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const username: string =
    (body?.username ?? '').toString().trim().slice(0, 32) || 'زائر GenerationX'

  // Generate a pseudo Discord ID based on username
  const pseudoId =
    'demo_' + Buffer.from(username).toString('hex').slice(0, 16)

  const user = await upsertUserFromDiscord(
    {
      id: pseudoId,
      username,
      discriminator: '0000',
      avatar: null,
      email: null,
    },
    { inGuild: false, verified: false }
  )

  await setSession(user)
  return NextResponse.json({ ok: true, user })
}
