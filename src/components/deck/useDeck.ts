import { useEffect, useRef, useState } from 'react'
import type { Post } from '../../lib/posts'

// Plays the 30-second previews for a list of song posts. Shared by the deck and the tracklist.
export function useDeck(songs: Post[]) {
  const tracks = [...songs].reverse() // songs arrive newest first; tape order is oldest first
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const nextRef = useRef<() => void>(() => {})

  const index = tracks.findIndex((t) => t.id === currentId)
  const current = index >= 0 ? tracks[index] : null
  const side: 'A' | 'B' = index >= 6 ? 'B' : 'A'
  const progress = duration > 0 ? Math.min(time / duration, 1) : 0
  const playable = tracks.filter((t) => t.preview_url)

  function getAudio() {
    if (!audioRef.current) {
      const a = new Audio()
      a.preload = 'none'
      a.ontimeupdate = () => setTime(a.currentTime)
      a.onloadedmetadata = () => setDuration(a.duration || 0)
      a.onended = () => nextRef.current()
      a.onplay = () => setIsPlaying(true)
      a.onpause = () => setIsPlaying(false)
      audioRef.current = a
    }
    return audioRef.current
  }

  function play(track: Post) {
    if (!track.preview_url) return
    setError(null)
    const a = getAudio()
    if (a.src !== track.preview_url) {
      a.src = track.preview_url
      setTime(0)
      setDuration(0)
    }
    setCurrentId(track.id)
    a.play().catch(() => setError("Couldn't play that preview."))
  }

  function step(direction: 1 | -1) {
    if (playable.length === 0) return
    const at = playable.findIndex((t) => t.id === currentId)
    if (at === -1) return play(direction === 1 ? playable[0] : playable[playable.length - 1])
    play(playable[(at + direction + playable.length) % playable.length])
  }

  useEffect(() => {
    nextRef.current = () => step(1)
  })

  function toggle() {
    const a = getAudio()
    if (current && a.src === current.preview_url) {
      if (a.paused) a.play().catch(() => setError("Couldn't play that preview."))
      else a.pause()
    } else {
      const start = current?.preview_url ? current : playable[0]
      if (start) play(start)
    }
  }

  function pick(track: Post) {
    if (track.id === currentId) return toggle()
    if (track.preview_url) play(track)
    else {
      audioRef.current?.pause()
      setCurrentId(track.id)
    }
  }

  function seek(ratio: number) {
    if (audioRef.current && duration > 0) audioRef.current.currentTime = ratio * duration
  }

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  // If the track that was playing gets deleted (by anyone), stop the sound.
  useEffect(() => {
    if (currentId && !songs.some((t) => t.id === currentId)) audioRef.current?.pause()
  }, [currentId, songs])

  return {
    tracks,
    current,
    currentId,
    side,
    isPlaying,
    time,
    duration,
    progress,
    playable,
    error,
    toggle,
    step,
    pick,
    seek,
  }
}

export type DeckState = ReturnType<typeof useDeck>
