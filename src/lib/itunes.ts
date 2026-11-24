// Apple's free iTunes Search API: no key, works from the browser, gives 30-second previews.
export interface SongResult {
  id: string
  title: string
  artist: string
  artwork_url: string | null
  preview_url: string | null
  store_url: string | null
}

interface RawTrack {
  trackId?: number
  trackName?: string
  artistName?: string
  artworkUrl100?: string
  previewUrl?: string
  trackViewUrl?: string
}

const https = (url?: string) => (url && url.startsWith('https://') ? url : null)

// Apple allows roughly 20 searches a minute per connection. Three guards keep us well under:
// repeat searches come from memory, we never search for the same text twice in a row, and if
// Apple does say "too many" we stop asking for a minute so the block doesn't get longer.
const CACHE_LIMIT = 60
const BLOCK_MS = 60_000
const cache = new Map<string, SongResult[]>()
let blockedUntil = 0

export const RATE_LIMIT_MESSAGE = 'Too many searches. Wait a minute, then try again.'

export async function searchSongs(term: string, signal?: AbortSignal): Promise<SongResult[]> {
  const q = term.trim()
  if (!q) return []
  const key = q.toLowerCase()
  const cached = cache.get(key)
  if (cached) return cached
  if (Date.now() < blockedUntil) throw new Error(RATE_LIMIT_MESSAGE)

  const params = new URLSearchParams({ term: q, media: 'music', entity: 'song', limit: '15' })
  const res = await fetch(`https://itunes.apple.com/search?${params}`, { signal })
  if (res.status === 403 || res.status === 429) {
    blockedUntil = Date.now() + BLOCK_MS
    throw new Error(RATE_LIMIT_MESSAGE)
  }
  if (!res.ok) throw new Error('Search failed. Try again.')
  const data = (await res.json()) as { results?: RawTrack[] }
  const results = (data.results ?? [])
    .filter((t) => t.trackId && t.trackName && t.artistName)
    .map((t) => ({
      id: String(t.trackId),
      title: t.trackName!,
      artist: t.artistName!,
      // The API returns 100px art; ask for a sharper version.
      artwork_url: https(t.artworkUrl100?.replace('100x100bb', '300x300bb')),
      preview_url: https(t.previewUrl),
      store_url: https(t.trackViewUrl),
    }))
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!)
  cache.set(key, results)
  return results
}

// Links that open the full song in the listener's own app. No API, no key, no quota.
export function fullSongLinks(title: string, artist: string, storeUrl: string | null) {
  const q = encodeURIComponent(`${artist} ${title}`)
  return [
    {
      brand: 'youtube' as const,
      label: 'YouTube',
      href: `https://www.youtube.com/results?search_query=${q}`,
    },
    {
      brand: 'spotify' as const,
      label: 'Spotify',
      href: `https://open.spotify.com/search/${q}`,
    },
    ...(storeUrl ? [{ brand: 'apple' as const, label: 'Apple Music', href: storeUrl }] : []),
  ]
}
