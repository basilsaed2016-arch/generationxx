import { NextResponse } from 'next/server'
import { getSession, discordAvatarUrl } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({
    user: {
      ...user,
      avatarUrl: discordAvatarUrl(user.discordId, user.avatar),
    },
  })
}
