import { createAvatar } from '@dicebear/core'
import * as lorelei from '@dicebear/lorelei'

// Lorelei by Lisa Wischofsky, CC0 1.0 (no credit required). A profile's `avatar` is just the seed.
const cache = new Map<string, string>()

export function avatarUrl(seed: string): string {
  let url = cache.get(seed)
  if (!url) {
    url = createAvatar(lorelei, {
      seed,
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    }).toDataUri()
    cache.set(seed, url)
  }
  return url
}

export function randomSeeds(count: number, keep?: string): string[] {
  const seeds = Array.from({ length: count }, () => Math.random().toString(36).slice(2, 10))
  if (keep) seeds[0] = keep
  return seeds
}
