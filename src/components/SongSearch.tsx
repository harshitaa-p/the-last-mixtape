import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Search, Send } from 'lucide-react'
import { searchSongs, type SongResult } from '../lib/itunes'
import { addSongPost } from '../lib/posts'
import { ErrorText, paperBtnCls, paperFieldCls } from '../ui'
import { PaperPanel } from './PaperPanel'

interface Props {
  roomId: string
  onDone: () => void
  onClose: () => void
}

const AUTO_MIN_LETTERS = 3
const TYPING_PAUSE_MS = 700

function Art({ url, size }: { url: string | null; size: number }) {
  return url ? (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-md object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="shrink-0 rounded-md bg-ink-dark/10"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}

export function SongSearch({ roomId, onDone, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SongResult[]>([])
  const [searching, setSearching] = useState(false)
  const [picked, setPicked] = useState<SongResult | null>(null)
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const controllerRef = useRef<AbortController | null>(null)
  const lastTermRef = useRef('')

  // Searches once per distinct text, and cancels an older search still in flight.
  const run = useCallback(async (term: string) => {
    const q = term.trim()
    if (!q || q.toLowerCase() === lastTermRef.current) return
    lastTermRef.current = q.toLowerCase()
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setSearching(true)
    setError(null)
    try {
      setResults(await searchSongs(q, controller.signal))
    } catch (err) {
      if (!controller.signal.aborted) {
        lastTermRef.current = '' // allow a retry of the same text
        setError(err instanceof Error ? err.message : 'Search failed. Try again.')
      }
    } finally {
      if (!controller.signal.aborted) setSearching(false)
    }
  }, [])

  // Search while typing only from 3 letters on, and only after a pause. Shorter names
  // (like "Tum" is fine, "Ae" is not) can be searched by pressing Enter.
  useEffect(() => {
    const q = query.trim()
    if (q.length < AUTO_MIN_LETTERS) return
    const timer = setTimeout(() => run(q), TYPING_PAUSE_MS)
    return () => clearTimeout(timer)
  }, [query, run])

  useEffect(() => () => controllerRef.current?.abort(), [])

  async function send() {
    if (!picked) return
    setSending(true)
    setError(null)
    try {
      await addSongPost(roomId, picked, note)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send. Try again.")
      setSending(false)
    }
  }

  return (
    <PaperPanel title={picked ? 'add your note' : 'dedicate a song'} onClose={onClose}>
      {!picked ? (
        <>
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault()
              run(query)
            }}
          >
            <Search
              size={18}
              aria-hidden="true"
              className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-dark/45"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search a song or artist"
              aria-label="search a song or artist"
              className={paperFieldCls}
            />
            {searching && (
              <Loader2
                size={16}
                aria-hidden="true"
                className="absolute top-1/2 right-4 -translate-y-1/2 animate-spin text-ink-dark/50"
              />
            )}
          </form>
          {query.trim().length > 0 && query.trim().length < AUTO_MIN_LETTERS && !searching && (
            <p className="font-body text-xs text-ink-dark/55">
              Keep typing, or press Enter to search for a short name.
            </p>
          )}
          <ErrorText message={error} />
          {query.trim() && !searching && results.length === 0 && !error && (
            <p className="text-center font-body text-sm text-ink-dark/60">
              No songs found. Try the artist's name too.
            </p>
          )}
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {query.trim() &&
              results.map((song) => (
                <li key={song.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(song)}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-ink-dark/5"
                  >
                    <Art url={song.artwork_url} size={48} />
                    <span className="min-w-0">
                      <span className="block truncate font-body text-sm font-medium">
                        {song.title}
                      </span>
                      <span className="block truncate font-body text-xs text-ink-dark/60">
                        {song.artist}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-ink-dark/5 p-3">
            <Art url={picked.artwork_url} size={64} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-medium">{picked.title}</p>
              <p className="truncate font-body text-xs text-ink-dark/60">{picked.artist}</p>
            </div>
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="flex items-center gap-1 rounded-full border border-ink-dark/20 px-3 py-1.5 font-body text-xs hover:bg-ink-dark/5"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              change
            </button>
          </div>
          <label className="block">
            <span className="mb-1 block font-body text-xs text-ink-dark/60">
              what do you want them to know? (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="this one's for you, you'll get it at 2am"
              className={`${paperFieldCls} resize-none pl-4 font-hand text-xl leading-snug`}
            />
          </label>
          <ErrorText message={error} />
          <button type="button" onClick={send} disabled={sending} className={paperBtnCls}>
            <Send size={16} aria-hidden="true" />
            {sending ? 'sending…' : 'add to the mixtape'}
          </button>
        </>
      )}
    </PaperPanel>
  )
}
