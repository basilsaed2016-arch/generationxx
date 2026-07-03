import { NextRequest, NextResponse } from 'next/server'
import {
  isDiscordConfigured,
  getDiscordConfig,
  buildRedirectUri,
  exchangeCode,
  fetchDiscordUser,
  checkGuildMembership,
  upsertUserFromDiscord,
  setSession,
} from '@/lib/auth'

const DISCORD_API = 'https://discord.com/api/v10'
const SCOPES = ['identify', 'email', 'guilds'].join(' ')

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Determine the origin for building the redirect URI
  // Works for both localhost and Vercel (https)
  const origin = req.headers.get('origin') ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const redirectUri = buildRedirectUri(origin)

  // ===== Step 1: If Discord returned an error, redirect home =====
  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${error}`, req.url))
  }

  // ===== Step 2: No code yet → redirect user to Discord OAuth =====
  if (!code) {
    // If Discord is not configured, return an error (no fallback in production)
    if (!isDiscordConfigured()) {
      return NextResponse.redirect(new URL('/?auth_error=not_configured', req.url))
    }

    const cfg = getDiscordConfig()
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      prompt: 'consent',
    })

    return NextResponse.redirect(
      `${DISCORD_API}/oauth2/authorize?${params.toString()}`
    )
  }

  // ===== Step 3: Exchange code for access token =====
  const token = await exchangeCode(code, redirectUri)
  if (!token) {
    return NextResponse.redirect(new URL('/?auth_error=token', req.url))
  }

  // ===== Step 4: Fetch Discord user profile =====
  const profile = await fetchDiscordUser(token.access_token)
  if (!profile) {
    return NextResponse.redirect(new URL('/?auth_error=profile', req.url))
  }

  // ===== Step 5: Check guild membership + verified role =====
  const verification = await checkGuildMembership(token.access_token, profile.id)

  // ===== Step 6: Upsert user in DB + set session cookie =====
  const user = await upsertUserFromDiscord(profile, verification)
  await setSession(user)

  // ===== Step 7: Redirect home =====
  return NextResponse.redirect(new URL('/', req.url))
}
