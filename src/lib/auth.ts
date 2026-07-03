import { cookies } from 'next/headers'
import { db } from './db'

/**
 * Authentication & Citizen Verification helper.
 *
 * Flow:
 *  1. User clicks "Login with Discord" → redirected to Discord OAuth2.
 *  2. Discord calls back /api/auth/discord with a `code`.
 *  3. We exchange the code for an access token.
 *  4. We fetch the user's Discord profile (/users/@me).
 *  5. We fetch the user's guild membership (/users/@me/guilds) to check if
 *     they're in the configured GenerationX server.
 *  6. If they're in the server, we fetch their roles in that guild
 *     (/guilds/{guild}/members/{user}) to check for the "Verified Citizen" role.
 *  7. We upsert the user in DB and store a session cookie containing:
 *       - id, discordId, username, avatar, isAdmin
 *       - inGuild: boolean (member of GenerationX server)
 *       - verified: boolean (has the Verified Citizen role)
 *
 * Env vars (all read from .env, never hardcoded):
 *  - DISCORD_CLIENT_ID
 *  - DISCORD_CLIENT_SECRET
 *  - DISCORD_GUILD_ID
 *  - DISCORD_VERIFIED_ROLE_ID
 *  - ADMIN_DISCORD_ID
 *  - NEXT_PUBLIC_APP_URL (optional override for callback URL)
 */

export type SessionUser = {
  id: string
  discordId: string
  username: string
  avatar: string | null
  discriminator: string | null
  isAdmin: boolean
  inGuild: boolean
  verified: boolean
}

function encodeToken(payload: SessionUser): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodeToken(token: string): SessionUser | null {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf-8')
    return JSON.parse(json) as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('gx_session')?.value
  if (!token) return null
  const user = decodeToken(token)
  if (!user) return null
  // Refresh admin flag from DB in case it changed
  const dbUser = await db.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return null
  return {
    ...user,
    isAdmin: dbUser.isAdmin,
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies()
  cookieStore.set('gx_session', encodeToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('gx_session')
}

// ===== Config =====

export function isDiscordConfigured(): boolean {
  return Boolean(
    process.env.DISCORD_CLIENT_ID &&
    process.env.DISCORD_CLIENT_SECRET
  )
}

export function getDiscordConfig() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    guildId: process.env.DISCORD_GUILD_ID || '',
    verifiedRoleId: process.env.DISCORD_VERIFIED_ROLE_ID || '',
    adminDiscordId: process.env.ADMIN_DISCORD_ID || '',
  }
}

/**
 * Build the OAuth redirect URI.
 * - In production: uses NEXT_PUBLIC_APP_URL if set, otherwise the request origin.
 * - In development: uses the request origin (http://localhost:3000).
 *
 * This ensures the callback works on both localhost and Vercel.
 */
export function buildRedirectUri(requestOrigin: string): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL
  if (explicit) {
    return `${explicit.replace(/\/$/, '')}/api/auth/discord`
  }
  return `${requestOrigin.replace(/\/$/, '')}/api/auth/discord`
}

const DISCORD_API = 'https://discord.com/api/v10'

/**
 * Exchange the OAuth code for an access token.
 */
export async function exchangeCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; token_type: string } | null> {
  const cfg = getDiscordConfig()
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return {
    access_token: data.access_token,
    token_type: data.token_type,
  }
}

/**
 * Fetch the Discord user profile (/users/@me).
 */
export async function fetchDiscordUser(accessToken: string): Promise<{
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string | null
} | null> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return {
    id: data.id,
    username: data.username,
    discriminator: data.discriminator ?? '0',
    avatar: data.avatar ?? null,
    email: data.email ?? null,
  }
}

/**
 * Check if the user is a member of the configured guild AND has the verified role.
 * Uses the bot-free approach: we need the user's Bearer token to call
 * /users/@me/guilds, but to get their roles we need either:
 *   (a) a bot token with the Server Members Intent, OR
 *   (b) the user to be in the guild (we can call /guilds/{guild}/members/{user}
 *       with a bot token).
 *
 * For a pure OAuth-only flow (no bot), we can only check guild membership via
 * /users/@me/guilds — but this does NOT return roles.
 *
 * To check roles, set DISCORD_BOT_TOKEN in .env (optional but recommended).
 * If no bot token is set, we fall back to guild-membership-only verification
 * (inGuild = true, verified = inGuild).
 */

export async function checkGuildMembership(
  accessToken: string,
  userId: string
): Promise<{ inGuild: boolean; verified: boolean }> {
  const cfg = getDiscordConfig()
  const empty = { inGuild: false, verified: false }

  if (!cfg.guildId) {
    // No guild configured — can't verify
    return empty
  }

  // Check guild membership via /users/@me/guilds
  let inGuild = false
  try {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) {
      const guilds: Array<{ id: string }> = await res.json()
      inGuild = guilds.some((g) => g.id === cfg.guildId)
    }
  } catch {
    /* ignore */
  }

  // If we have a bot token, fetch the member's roles for a precise check
  const botToken = process.env.DISCORD_BOT_TOKEN
  let verified = false

  if (inGuild && botToken && cfg.verifiedRoleId) {
    try {
      const res = await fetch(
        `${DISCORD_API}/guilds/${cfg.guildId}/members/${userId}`,
        { headers: { Authorization: `Bot ${botToken}` } }
      )
      if (res.ok) {
        const member: { roles?: string[] } = await res.json()
        verified = (member.roles ?? []).includes(cfg.verifiedRoleId)
      }
    } catch {
      /* ignore */
    }
  } else if (inGuild && !cfg.verifiedRoleId) {
    // No role ID configured — treat guild membership as verification
    verified = true
  }

  return { inGuild, verified }
}

/**
 * Upsert a user in the DB after Discord login, including verification status.
 */
export async function upsertUserFromDiscord(
  profile: {
    id: string
    username: string
    discriminator?: string | null
    avatar?: string | null
    email?: string | null
  },
  verification: { inGuild: boolean; verified: boolean }
): Promise<SessionUser> {
  const cfg = getDiscordConfig()
  const isAdmin = profile.id === cfg.adminDiscordId

  const user = await db.user.upsert({
    where: { discordId: profile.id },
    update: {
      username: profile.username,
      discriminator: profile.discriminator ?? null,
      avatar: profile.avatar ?? null,
      email: profile.email ?? null,
      isAdmin,
    },
    create: {
      discordId: profile.id,
      username: profile.username,
      discriminator: profile.discriminator ?? null,
      avatar: profile.avatar ?? null,
      email: profile.email ?? null,
      isAdmin,
    },
  })

  return {
    id: user.id,
    discordId: user.discordId,
    username: user.username,
    avatar: user.avatar,
    discriminator: user.discriminator,
    isAdmin: user.isAdmin,
    inGuild: verification.inGuild,
    verified: verification.verified,
  }
}

/**
 * Build the CDN URL for a Discord avatar.
 */
export function discordAvatarUrl(discordId: string, avatar: string | null): string {
  if (avatar) {
    const ext = avatar.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.${ext}?size=256`
  }
  return `https://cdn.discordapp.com/embed/avatars/0.png`
}
