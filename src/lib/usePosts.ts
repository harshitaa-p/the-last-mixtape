import { useCallback, useEffect, useState } from 'react'
import { listPosts, removePost, signedUrls, watchPosts, type Post } from './posts'

// Loads every post in a space, keeps it fresh when friends add things, and handles delete.
export function usePosts(roomId: string) {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [reload, setReload] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listPosts(roomId)
      .then(async (rows) => {
        if (cancelled) return
        setPosts(rows)
        const paths = rows.map((p) => p.media_path).filter((p): p is string => !!p)
        if (paths.length === 0) return
        const fresh = await signedUrls(paths)
        if (!cancelled) setUrls((old) => ({ ...old, ...fresh }))
      })
      .catch((err: Error) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [roomId, reload])

  useEffect(() => watchPosts(roomId, () => setReload((n) => n + 1)), [roomId])

  const refresh = useCallback(() => setReload((n) => n + 1), [])

  async function remove(post: Post) {
    setError(null)
    try {
      await removePost(post)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that. Try again.")
    }
  }

  return { posts, urls, error, refresh, remove }
}
