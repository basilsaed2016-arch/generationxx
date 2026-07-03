/**
 * Kick.com logo icon.
 * Single-color (currentColor) so it inherits text color.
 */
export default function KickIcon({
  className = '',
  size,
}: {
  className?: string
  size?: number
}) {
  const style = size ? { width: size, height: size } : undefined
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 3h5v5h2V5h2V3h5v5h-2v2h-2v4h2v2h2v5h-5v-2h-2v-3h-2v5H3V3z" />
    </svg>
  )
}
