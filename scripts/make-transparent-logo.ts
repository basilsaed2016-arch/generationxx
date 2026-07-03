/**
 * Remove background from the GenerationX logo and save as transparent PNG/WebP.
 *
 * Strategy:
 * - Keep bright pixels (silver/white "GENERATION" text)
 * - Keep saturated cyan pixels (the "X" shape — brand color #00F5D4)
 * - Keep dark text pixels ("ROLEPLAY") that are surrounded by kept pixels
 * - Make the misty teal/palm-tree background transparent
 *
 * Output: /home/z/my-project/public/gx-logo-transparent.webp (with alpha)
 */
import sharp from 'sharp'

const SRC = '/home/z/my-project/upload/gx-banner.webp'
const DEST_WEBP = '/home/z/my-project/public/gx-logo-transparent.webp'
const DEST_PNG = '/home/z/my-project/public/gx-logo-transparent.png'

async function main() {
  // Load as raw RGBA
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .resize({ width: 800, withoutEnlargement: false })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const channels = info.channels // 4 (RGBA)
  const out = Buffer.alloc(w * h * channels)

  // First pass: classify each pixel
  // 0 = background (transparent), 1 = keep
  const mask = new Uint8Array(w * h)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * channels
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max

      // Cyan detection: hue near 180 (cyan), green and blue close and high, red lower
      const isCyan = g > 120 && b > 120 && r < g * 0.85 && r < b * 0.85 && saturation > 0.25

      // Bright text detection
      const isBright = luminance > 165 && saturation < 0.35

      // Very bright cyan X
      const isBrightCyan = isCyan && luminance > 100

      if (isBright || isBrightCyan) {
        mask[y * w + x] = 1
      }
    }
  }

  // Second pass: dilate the mask (expand kept regions by 1px) to catch text edges
  // that might have been missed (anti-aliasing pixels)
  const dilated = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      if (mask[idx]) {
        dilated[idx] = 1
        continue
      }
      // Check 4 neighbors
      let count = 0
      if (x > 0 && mask[idx - 1]) count++
      if (x < w - 1 && mask[idx + 1]) count++
      if (y > 0 && mask[idx - w]) count++
      if (y < h - 1 && mask[idx + w]) count++
      // Keep if 2+ neighbors are kept (fills gaps in text)
      if (count >= 2) dilated[idx] = 1
    }
  }

  // Third pass: for pixels marked as "keep", copy original color + full alpha.
  // For pixels NOT marked, set alpha to 0 (transparent).
  // For edge pixels (anti-aliasing), blend alpha based on neighbor count.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * channels
      const idx = y * w + x

      if (dilated[idx]) {
        out[i] = data[i]
        out[i + 1] = data[i + 1]
        out[i + 2] = data[i + 2]
        out[i + 3] = 255
      } else {
        // Check distance to nearest kept pixel for soft edges
        out[i] = data[i]
        out[i + 1] = data[i + 1]
        out[i + 2] = data[i + 2]
        out[i + 3] = 0
      }
    }
  }

  // Save as WebP with alpha
  await sharp(out, { raw: { width: w, height: h, channels } })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(DEST_WEBP)

  // Also save as PNG with alpha (maximum compatibility)
  await sharp(out, { raw: { width: w, height: h, channels } })
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(DEST_PNG)

  // Verify
  const resultMeta = await sharp(DEST_WEBP).metadata()
  console.log(`✓ Transparent logo saved`)
  console.log(`  WebP: ${DEST_WEBP} (${resultMeta.width}x${resultMeta.height}, hasAlpha: ${resultMeta.hasAlpha})`)
  console.log(`  PNG:  ${DEST_PNG}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
