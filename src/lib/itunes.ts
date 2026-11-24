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

export async function searchSongs(term: string, signal?: AbortSignal): Promise<SongResult[]> {
  const q = term.trim()
  if (!q) return []
  const params = new URLSearchParams({ term: q, media: 'music', entity: 'song', limit: '15' })
  const res = await fetch(`https://itunes.apple.com/search?${params}`, { signal })
  if (!res.ok) throw new Error('Search failed. Try again.')
  const data = (await res.json()) as { results?: RawTrack[] }
  return (data.results ?? [])
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
