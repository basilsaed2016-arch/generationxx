/**
 * Optimize product images:
 * - Resize to max 800x800 (preserve aspect)
 * - Convert PNG -> WebP (quality 82)
 * - Save to /home/z/my-project/public/products/
 *
 * Source files (in /home/z/my-project/upload/):
 *   VIP_Car.png            -> vip-car.webp
 *   VIP_VILLA.png          -> vip-villa.webp
 *   VIP_Pack.png           -> vip-pack.webp
 *   VIP_GANG.png           -> vip-gang.webp
 *   VIP_Weapon.png         -> vip-weapon.webp
 *   VIP_PED_1of1.png       -> vip-ped-1of1.webp
 *   STORAGE.png            -> vip-storage.webp
 *   Multi_Character.png    -> second-character.webp
 *   Car_Plate.png          -> special-car-plate.webp
 *   VIP_Phone_Number.png   -> special-phone-number.webp
 */
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'

const SRC = '/home/z/my-project/upload'
const DEST = '/home/z/my-project/public/products'

const mapping: Array<[string, string]> = [
  ['VIP_Car.png', 'vip-car.webp'],
  ['VIP_VILLA.png', 'vip-villa.webp'],
  ['VIP_Pack.png', 'vip-pack.webp'],
  ['VIP_GANG.png', 'vip-gang.webp'],
  ['VIP_Weapon.png', 'vip-weapon.webp'],
  ['VIP_PED_1of1.png', 'vip-ped-1of1.webp'],
  ['STORAGE.png', 'vip-storage.webp'],
  ['Multi_Character.png', 'second-character.webp'],
  ['Car_Plate.png', 'special-car-plate.webp'],
  ['VIP_Phone_Number.png', 'special-phone-number.webp'],
]

async function main() {
  await mkdir(DEST, { recursive: true })
  for (const [src, dst] of mapping) {
    const srcPath = path.join(SRC, src)
    const dstPath = path.join(DEST, dst)
    const info = await sharp(srcPath)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dstPath)
    console.log(`✓ ${src} -> ${dst}  (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB)`)
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
