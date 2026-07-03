/**
 * Update existing products in DB to use the optimized local images.
 *
 * Mapping (by product name -> image path):
 *   VIP Car              -> /products/vip-car.webp
 *   VIP Villa            -> /products/vip-villa.webp
 *   VIP Personal Pack    -> /products/vip-pack.webp
 *   VIP Gang             -> /products/vip-gang.webp
 *   VIP Weapon           -> /products/vip-weapon.webp
 *   VIP PED (1 Of 1)     -> /products/vip-ped-1of1.webp
 *   VIP Storage          -> /products/vip-storage.webp
 *   Second Character     -> /products/second-character.webp
 *   Special Car Plate    -> /products/special-car-plate.webp
 *   Special Phone Number -> /products/special-phone-number.webp
 */
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const db = new PrismaClient()

const imageMap: Record<string, string> = {
  'VIP Car': '/products/vip-car.webp',
  'VIP Villa': '/products/vip-villa.webp',
  'VIP Personal Pack': '/products/vip-pack.webp',
  'VIP Gang': '/products/vip-gang.webp',
  'VIP Weapon': '/products/vip-weapon.webp',
  'VIP PED (1 Of 1)': '/products/vip-ped-1of1.webp',
  'VIP Storage': '/products/vip-storage.webp',
  'Second Character': '/products/second-character.webp',
  'Special Car Plate': '/products/special-car-plate.webp',
  'Special Phone Number': '/products/special-phone-number.webp',
}

const KICK_AVATARS_DIR = '/home/z/my-project/public/streamers'

// Streamer kick slugs to fetch avatars for
const streamerSlugs = [
  'rayder-tv',
  'abughadabb',
  'loay_huda',
  '1abufayez1',
  'imxaaim',
  'zinghu',
  'kharashka',
]

async function fetchKickAvatar(slug: string): Promise<{ avatarUrl: string | null; localPath: string }> {
  const url = `https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GenerationX-AvatarFetcher/1.0',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { avatarUrl: null, localPath: '' }
    const data: any = await res.json()
    // Kick returns user.profile_pic as the avatar URL
    const profilePic: string | undefined = data?.user?.profile_pic
    if (!profilePic) return { avatarUrl: null, localPath: '' }
    return { avatarUrl: profilePic, localPath: `/streamers/${slug}.webp` }
  } catch {
    return { avatarUrl: null, localPath: '' }
  }
}

async function downloadAndOptimize(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GenerationX-AvatarFetcher/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    await sharp(buf)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(destPath)
    return true
  } catch {
    return false
  }
}

async function main() {
  // ===== Update product images =====
  console.log('=== Updating product images ===')
  for (const [name, imagePath] of Object.entries(imageMap)) {
    const product = await db.product.findFirst({ where: { name } })
    if (!product) {
      console.log(`  ✗ Product "${name}" not found`)
      continue
    }
    await db.product.update({
      where: { id: product.id },
      data: { image: imagePath },
    })
    console.log(`  ✓ ${name} -> ${imagePath}`)
  }

  // ===== Download Kick avatars for streamers =====
  console.log('\n=== Downloading Kick avatars ===')
  await mkdir(KICK_AVATARS_DIR, { recursive: true })

  for (const slug of streamerSlugs) {
    const { avatarUrl, localPath } = await fetchKickAvatar(slug)
    if (!avatarUrl) {
      console.log(`  ✗ ${slug}: no avatar URL returned`)
      continue
    }
    const destPath = path.join(KICK_AVATARS_DIR, `${slug}.webp`)
    const ok = await downloadAndOptimize(avatarUrl, destPath)
    if (!ok) {
      console.log(`  ✗ ${slug}: download failed`)
      continue
    }
    // Update DB
    const streamer = await db.streamer.findUnique({ where: { kickSlug: slug } })
    if (streamer) {
      await db.streamer.update({
        where: { id: streamer.id },
        data: { avatar: localPath },
      })
    }
    console.log(`  ✓ ${slug} -> ${localPath}`)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
