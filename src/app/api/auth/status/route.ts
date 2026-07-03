import { NextResponse } from 'next/server'
import { isDiscordConfigured, getDiscordConfig } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Public auth status — tells the frontend:
 *  - whether Discord OAuth is configured
 *  - whether demo mode is available (when OAuth is NOT configured)
 *  - whether guild + role verification is configured
 *
 * No secrets are exposed.
 */
export async function GET() {
  const cfg = getDiscordConfig()
  const configured = isDiscordConfigured()
  return NextResponse.json({
    discordConfigured: configured,
    demoAvailable: !configured,
    guildConfigured: Boolean(cfg.guildId),
    roleConfigured: Boolean(cfg.verifiedRoleId),
    botTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN),
  })
}
