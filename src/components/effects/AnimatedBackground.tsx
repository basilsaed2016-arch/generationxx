'use client'

import { memo } from 'react'

/**
 * Cinematic GenerationX background.
 *
 * Strict palette: black, dark gray, white, cyan only.
 *
 * Layers (cheap to paint, GPU-friendly):
 *  1. Base radial cyan glow (top)
 *  2. Soft fog band (bottom)
 *  3. Palm tree silhouettes (SVG, two layers for parallax depth)
 *  4. Subtle grain (data-uri SVG, opacity 2%)
 *
 * No heavy blur, no colorful gradients, no particles.
 */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#090909]" aria-hidden>
      {/* Top cyan glow (single, subtle) */}
      <div
        className="absolute -top-32 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,245,212,0.10), transparent 70%)',
        }}
      />

      {/* Distant fog band — soft horizontal gradient near the horizon */}
      <div
        className="absolute inset-x-0 top-[55%] h-[40%]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,245,212,0.04) 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Far palm silhouettes (smaller, more transparent) */}
      <div className="absolute inset-x-0 bottom-0 h-[45%]">
        <svg
          viewBox="0 0 1600 400"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full opacity-[0.35]"
          aria-hidden
        >
          <g fill="#050505">
            <PalmTree x={120} y={380} scale={0.7} />
            <PalmTree x={320} y={390} scale={0.55} />
            <PalmTree x={520} y={385} scale={0.65} />
            <PalmTree x={760} y={395} scale={0.5} />
            <PalmTree x={980} y={385} scale={0.6} />
            <PalmTree x={1180} y={390} scale={0.55} />
            <PalmTree x={1420} y={385} scale={0.65} />
          </g>
        </svg>
      </div>

      {/* Near palm silhouettes (larger, darker — foreground) */}
      <div className="absolute inset-x-0 bottom-0 h-[30%]">
        <svg
          viewBox="0 0 1600 300"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full opacity-[0.85]"
          aria-hidden
        >
          <g fill="#000000">
            <PalmTree x={80} y={295} scale={1.0} />
            <PalmTree x={380} y={298} scale={0.85} />
            <PalmTree x={1280} y={298} scale={0.9} />
            <PalmTree x={1520} y={295} scale={1.0} />
          </g>
        </svg>
      </div>

      {/* Bottom solid fade to black — grounds the scene */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background: 'linear-gradient(to top, #050505, transparent)',
        }}
      />

      {/* Very subtle grain — barely visible, adds cinematic texture */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  )
}

/**
 * Single palm tree silhouette.
 * Centered at (x, y) which is the base of the trunk.
 * `scale` multiplies the whole tree.
 */
function PalmTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  // Trunk: slight curved tapering shape
  // Fronds: 7 elongated diamond-shaped leaves radiating from the top
  const s = scale
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Trunk */}
      <path
        d="M -6 0 C -4 -60 -2 -120 0 -180 C 2 -120 4 -60 6 0 Z"
        fill="currentColor"
      />
      {/* Fronds — drawn as quadratic curves fanning out */}
      <g transform="translate(0 -180)">
        <path d="M 0 0 C -30 -10 -60 -8 -90 5 C -55 -2 -25 0 0 0 Z" />
        <path d="M 0 0 C -25 -25 -45 -45 -55 -75 C -35 -45 -15 -20 0 0 Z" />
        <path d="M 0 0 C -10 -30 -10 -65 0 -95 C 5 -65 5 -30 0 0 Z" />
        <path d="M 0 0 C 10 -30 10 -65 0 -95 C -5 -65 -5 -30 0 0 Z" />
        <path d="M 0 0 C 25 -25 45 -45 55 -75 C 35 -45 15 -20 0 0 Z" />
        <path d="M 0 0 C 30 -10 60 -8 90 5 C 55 -2 25 0 0 0 Z" />
        <path d="M 0 0 C 15 -20 35 -30 60 -25 C 35 -15 15 -8 0 0 Z" />
      </g>
    </g>
  )
}

export default memo(AnimatedBackground)
