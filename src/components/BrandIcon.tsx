import { siApplemusic, siSpotify, siYoutube } from 'simple-icons'

// Brand marks from the Simple Icons set, drawn in each service's own colour.
// They are trademarks of YouTube, Spotify and Apple: only use them to link to those services,
// unaltered, and check each brand's guidelines before launch.
const ICONS = {
  youtube: siYoutube,
  spotify: siSpotify,
  apple: siApplemusic,
} as const

export type Brand = keyof typeof ICONS

export function BrandIcon({ brand, size = 16 }: { brand: Brand; size?: number }) {
  const icon = ICONS[brand]
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={`#${icon.hex}`}
      className="shrink-0"
    >
      <path d={icon.path} />
    </svg>
  )
}
