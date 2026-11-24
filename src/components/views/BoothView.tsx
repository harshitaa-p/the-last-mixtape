import { useEffect, useRef, useState } from 'react'
import { Camera, Download, Loader2, Minus, Plus, RotateCcw, Send, Trash2 } from 'lucide-react'
import { PhotoPrinter, type PrinterState } from '../PhotoPrinter'
import {
  captureFrame,
  composeStrip,
  FILTERS,
  FRAMES,
  type Filter,
  type Sticker,
} from '../../lib/booth'
import { useTheme } from '../../lib/themes'
import { addMediaPost } from '../../lib/posts'
import { ErrorText } from '../../ui'
import type { ViewProps } from './types'

type Phase = 'idle' | 'shooting' | 'printing' | 'done'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const chip = (on: boolean) =>
  `rounded-full px-4 py-2 font-body text-xs transition-colors ${
    on ? 'bg-paper font-medium text-ink-dark' : 'border border-white/15 text-ink-soft hover:text-ink'
  }`

export function BoothView({ roomId, userId, canAdd, refresh }: ViewProps) {
  const theme = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const aliveRef = useRef(true)
  const rawRef = useRef<HTMLCanvasElement[]>([]) // the pictures, kept so the strip can be redrawn
  const buildRef = useRef(0) // numbers each redraw so only the newest one wins
  const boxRef = useRef<HTMLDivElement>(null) // the strip on screen, for placing stickers
  const dragRef = useRef<string | null>(null)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [feeding, setFeeding] = useState(false) // true while the paper is still coming out
  const [cameraOn, setCameraOn] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [shots, setShots] = useState(4)
  const [filter, setFilter] = useState<Filter>('color')
  const [frameId, setFrameId] = useState('cream')
  const [count, setCount] = useState<number | null>(null)
  const [shotNo, setShotNo] = useState(0)
  const [flash, setFlash] = useState(false)
  const [thumbs, setThumbs] = useState<string[]>([])
  const [strip, setStrip] = useState<{ blob: Blob; url: string } | null>(null)
  const [caption, setCaption] = useState('')
  const [sending, setSending] = useState(false)
  const [shared, setShared] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const busy = phase === 'shooting' || phase === 'printing'
  const printerState: PrinterState =
    phase === 'printing' || feeding ? 'printing' : strip ? 'done' : 'ready'

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    const url = strip?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [strip])

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOn])

  async function openCamera() {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't use the camera.")
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      setCameraOn(true)
    } catch {
      setError("Couldn't use the camera. Allow camera access in your browser and try again.")
    }
  }

  async function takeStrip() {
    const video = videoRef.current
    if (!video || busy) return
    setError(null)
    setStrip(null)
    setShared(false)
    setThumbs([])
    setStickers([])
    setSelectedId(null)
    setPhase('shooting')
    try {
      const frames: HTMLCanvasElement[] = []
      for (let i = 1; i <= shots; i++) {
        setShotNo(i)
        for (let c = 3; c >= 1; c--) {
          setCount(c)
          await sleep(1000)
          if (!aliveRef.current) return
        }
        setCount(null)
        setFlash(true)
        const photo = captureFrame(video)
        frames.push(photo)
        setThumbs((t) => [...t, photo.toDataURL('image/jpeg', 0.5)])
        await sleep(160)
        setFlash(false)
        await sleep(700)
        if (!aliveRef.current) return
      }
      rawRef.current = frames
      setPhase('printing')
      const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0]
      const blob = await composeStrip(frames, frame, 'the last mixtape', filter)
      await sleep(600)
      if (!aliveRef.current) return
      setStrip({ blob, url: URL.createObjectURL(blob) })
      setPhase('done')
      setFeeding(true)
      setTimeout(() => aliveRef.current && setFeeding(false), 3700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setPhase('idle')
      setCount(null)
      setFlash(false)
    }
  }

  // Redraws the strip from the pictures already taken, with a different frame or look.
  async function redraw(nextFrameId: string, nextFilter: Filter) {
    if (rawRef.current.length === 0) return
    const mine = ++buildRef.current
    setError(null)
    try {
      const frame = FRAMES.find((f) => f.id === nextFrameId) ?? FRAMES[0]
      const blob = await composeStrip(rawRef.current, frame, 'the last mixtape', nextFilter)
      if (!aliveRef.current || mine !== buildRef.current) return
      setStrip({ blob, url: URL.createObjectURL(blob) })
      setShared(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't redraw the strip. Try again.")
    }
  }

  function chooseFrame(id: string) {
    setFrameId(id)
    if (phase === 'done') redraw(id, filter)
  }

  function chooseFilter(next: Filter) {
    setFilter(next)
    if (phase === 'done') redraw(frameId, next)
  }

  const clamp = (n: number) => Math.min(0.97, Math.max(0.03, n))

  function addSticker(emoji: string) {
    const sticker: Sticker = {
      id: crypto.randomUUID(),
      emoji,
      x: 0.2 + Math.random() * 0.6,
      y: 0.12 + Math.random() * 0.76,
      size: 0.14,
    }
    setStickers((list) => [...list, sticker])
    setSelectedId(sticker.id)
    setShared(false)
  }

  function patchSticker(id: string, change: Partial<Sticker>) {
    setStickers((list) => list.map((s) => (s.id === id ? { ...s, ...change } : s)))
    setShared(false)
  }

  function removeSticker(id: string) {
    setStickers((list) => list.filter((s) => s.id !== id))
    setSelectedId(null)
    setShared(false)
  }

  function startDrag(e: React.PointerEvent<HTMLElement>, id: string) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = id
    setSelectedId(id)
  }

  function drag(e: React.PointerEvent<HTMLElement>) {
    const id = dragRef.current
    const box = boxRef.current?.getBoundingClientRect()
    if (!id || !box) return
    patchSticker(id, {
      x: clamp((e.clientX - box.left) / box.width),
      y: clamp((e.clientY - box.top) / box.height),
    })
  }

  function nudge(e: React.KeyboardEvent<HTMLElement>, s: Sticker) {
    const step = 0.02
    const moves: Record<string, Partial<Sticker>> = {
      ArrowLeft: { x: clamp(s.x - step) },
      ArrowRight: { x: clamp(s.x + step) },
      ArrowUp: { y: clamp(s.y - step) },
      ArrowDown: { y: clamp(s.y + step) },
    }
    if (e.key === 'Delete' || e.key === 'Backspace') return removeSticker(s.id)
    if (moves[e.key]) {
      e.preventDefault()
      patchSticker(s.id, moves[e.key])
    }
  }

  // The strip as shared or saved: the printed strip plus any stickers drawn on top.
  async function finalBlob(): Promise<Blob> {
    if (!strip) throw new Error('There is no strip yet.')
    if (stickers.length === 0) return strip.blob
    const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0]
    return composeStrip(rawRef.current, frame, 'the last mixtape', filter, stickers)
  }

  async function save() {
    setError(null)
    try {
      const url = URL.createObjectURL(await finalBlob())
      const link = document.createElement('a')
      link.href = url
      link.download = 'photo-booth-strip.jpg'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the strip. Try again.")
    }
  }

  async function share() {
    if (!strip) return
    setSending(true)
    setError(null)
    try {
      await addMediaPost({
        roomId,
        userId,
        kind: 'photo',
        blob: await finalBlob(),
        extension: 'jpg',
        contentType: 'image/jpeg',
        caption: caption || 'photo booth',
      })
      setShared(true)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't share it. Try again.")
    } finally {
      setSending(false)
    }
  }

  const css = FILTERS.find((f) => f.id === filter)?.css ?? 'none'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-hand text-5xl leading-none text-ink">photo booth</h2>
        <p className="mt-1 font-body text-sm text-ink-soft">
          Pose, wait for the flash, and watch your strip print.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start xl:gap-12">
        <section
          aria-label="the booth"
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
        >
          <div
            className="mb-4 flex items-center justify-center gap-3 rounded-xl py-2.5"
            style={{ background: 'linear-gradient(180deg, #7a2c1f, #4a1a12)' }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-amber"
                style={{ boxShadow: '0 0 8px 2px rgba(232,162,74,0.8)' }}
              />
            ))}
            <span className="font-type text-xs tracking-[0.4em] text-paper uppercase">
              photo booth
            </span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-amber"
                style={{ boxShadow: '0 0 8px 2px rgba(232,162,74,0.8)' }}
              />
            ))}
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)', filter: css }}
            />
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
                <Camera size={32} aria-hidden="true" className="text-amber" />
                <p className="font-body text-sm text-ink-soft">
                  The booth needs your camera. Nothing is saved until you share a strip.
                </p>
                <button
                  type="button"
                  onClick={openCamera}
                  className="rounded-full bg-amber px-5 py-2 font-body text-sm font-semibold text-ink-dark hover:brightness-110"
                >
                  step into the booth
                </button>
              </div>
            )}
            {count !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-hand text-[9rem] leading-none text-paper drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                  {count}
                </span>
              </div>
            )}
            {phase === 'shooting' && (
              <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 font-type text-[11px] tracking-widest text-paper uppercase">
                photo {shotNo} of {shots}
              </span>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-white"
              style={{ opacity: flash ? 0.95 : 0, transition: flash ? 'none' : 'opacity 0.5s ease-out' }}
            />
          </div>

          <ul className="mt-3 flex gap-2" aria-label="photos taken">
            {Array.from({ length: shots }, (_, i) => (
              <li
                key={i}
                className="aspect-[4/3] flex-1 overflow-hidden rounded-md bg-black/30 ring-1 ring-white/10"
              >
                {thumbs[i] && (
                  <img
                    src={thumbs[i]}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: css }}
                  />
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={takeStrip}
            disabled={!cameraOn || busy || !canAdd}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-amber py-3 font-body text-sm font-semibold text-ink-dark transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {busy ? (
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            ) : phase === 'done' ? (
              <RotateCcw size={16} aria-hidden="true" />
            ) : (
              <Camera size={16} aria-hidden="true" />
            )}
            {phase === 'shooting'
              ? 'smile…'
              : phase === 'printing'
                ? 'printing…'
                : phase === 'done'
                  ? 'take another strip'
                  : `take ${shots} photos`}
          </button>
          <ErrorText message={error} />
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div>
              <p className="mb-2 font-type text-[11px] tracking-[0.25em] text-ink-soft uppercase">
                photos in the strip
              </p>
              <div className="flex gap-2">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={busy}
                    onClick={() => setShots(n)}
                    className={chip(shots === n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-type text-[11px] tracking-[0.25em] text-ink-soft uppercase">
                look
              </p>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={busy}
                    onClick={() => chooseFilter(f.id)}
                    className={chip(filter === f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-type text-[11px] tracking-[0.25em] text-ink-soft uppercase">
                frame
              </p>
              <div className="flex flex-wrap gap-3">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={busy}
                    title={f.label}
                    aria-label={f.bare ? 'no frame' : `${f.label} frame`}
                    aria-pressed={frameId === f.id}
                    onClick={() => chooseFrame(f.id)}
                    className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-transparent transition ${
                      frameId === f.id ? 'ring-2 ring-amber' : 'ring-1 ring-white/20'
                    }`}
                    style={{ background: f.swatch }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-type text-[11px] tracking-[0.25em] text-ink-soft uppercase">
                stickers
              </p>
              <div className="flex flex-wrap gap-2">
                {theme.stickers.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    disabled={!strip || busy}
                    aria-label={`add a ${emoji} sticker`}
                    onClick={() => addSticker(emoji)}
                    className="h-10 w-10 rounded-full border border-white/15 text-xl transition-transform hover:scale-110 hover:bg-white/10 disabled:opacity-35 disabled:hover:scale-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {!strip && (
                <p className="mt-2 font-body text-xs text-ink-soft">
                  Take a strip first, then decorate it.
                </p>
              )}
              {strip && stickers.length === 0 && (
                <p className="mt-2 font-body text-xs text-ink-soft">
                  Tap an emoji to add it, then drag it where you want it.
                </p>
              )}
              {stickers.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {selectedId && (
                    <>
                      <button
                        type="button"
                        aria-label="make the sticker smaller"
                        onClick={() => {
                          const s = stickers.find((x) => x.id === selectedId)
                          if (s) patchSticker(s.id, { size: Math.max(0.06, s.size - 0.03) })
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
                      >
                        <Minus size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="make the sticker bigger"
                        onClick={() => {
                          const s = stickers.find((x) => x.id === selectedId)
                          if (s) patchSticker(s.id, { size: Math.min(0.5, s.size + 0.03) })
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
                      >
                        <Plus size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSticker(selectedId)}
                        className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 font-body text-xs hover:bg-white/10"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        remove
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStickers([])
                      setSelectedId(null)
                      setShared(false)
                    }}
                    className="rounded-full px-3 py-1.5 font-body text-xs text-ink-soft underline hover:text-ink"
                  >
                    clear all
                  </button>
                </div>
              )}
            </div>
          </section>

          <section
            aria-label="your strip"
            className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
          >
            <PhotoPrinter state={printerState}>
              {!strip && (
                <div className="rounded-md border-2 border-dashed border-white/15 px-3 py-8 text-center font-body text-xs text-ink-soft">
                  {phase === 'printing' ? 'Here it comes…' : 'Your strip comes out here.'}
                </div>
              )}
              {strip && (
                  <div
                    ref={boxRef}
                    className="print-out relative w-full touch-none shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
                    style={{ containerType: 'inline-size' }}
                    onPointerDown={(e) => {
                      if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG')
                        setSelectedId(null)
                    }}
                  >
                    <img
                      src={strip.url}
                      alt="your photo booth strip"
                      draggable={false}
                      className="block w-full select-none"
                    />
                    {stickers.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        aria-label={`${s.emoji} sticker. Drag to move, arrow keys to nudge, Delete to remove`}
                        onPointerDown={(e) => startDrag(e, s.id)}
                        onPointerMove={drag}
                        onPointerUp={() => (dragRef.current = null)}
                        onPointerCancel={() => (dragRef.current = null)}
                        onKeyDown={(e) => nudge(e, s)}
                        onFocus={() => setSelectedId(s.id)}
                        className={`absolute cursor-grab touch-none leading-none select-none active:cursor-grabbing ${
                          selectedId === s.id ? 'rounded-lg outline-2 outline-dashed outline-amber' : ''
                        }`}
                        style={{
                          left: `${s.x * 100}%`,
                          top: `${s.y * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${s.size * 100}cqw`,
                        }}
                      >
                        {s.emoji}
                      </button>
                    ))}
                  </div>
              )}
            </PhotoPrinter>

            {strip && (
              <div className="flex w-full max-w-sm flex-col gap-3">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={300}
                  placeholder="add a caption (optional)"
                  aria-label="caption"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-hand text-xl text-ink outline-none placeholder:text-ink-soft focus:border-amber"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={share}
                    disabled={sending || shared || !canAdd}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber py-2.5 font-body text-sm font-semibold text-ink-dark hover:brightness-110 disabled:opacity-50"
                  >
                    <Send size={15} aria-hidden="true" />
                    {shared ? 'shared to photos' : sending ? 'sharing…' : 'share to the space'}
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 font-body text-sm text-ink hover:bg-white/10"
                  >
                    <Download size={15} aria-hidden="true" />
                    save
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
