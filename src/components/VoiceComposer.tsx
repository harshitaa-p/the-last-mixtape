import { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw, Send, Square } from 'lucide-react'
import { addMediaPost } from '../lib/posts'
import { ErrorText, paperBtnCls, paperFieldCls } from '../ui'
import { PaperPanel } from './PaperPanel'

const MAX_SECONDS = 120
const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

interface Props {
  roomId: string
  userId: string
  onDone: () => void
  onClose: () => void
}

function pickType(): string | undefined {
  return TYPES.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t))
}

function fileInfo(mime: string) {
  const base = mime.split(';')[0] || 'audio/webm'
  if (base === 'audio/mp4') return { contentType: base, extension: 'm4a' }
  if (base === 'audio/ogg') return { contentType: base, extension: 'ogg' }
  return { contentType: 'audio/webm', extension: 'webm' }
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function VoiceComposer({ roomId, userId, onDone, onClose }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [clip, setClip] = useState<{ blob: Blob; url: string } | null>(null)
  const [caption, setCaption] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function release() {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(
    () => () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      release()
    },
    [],
  )

  useEffect(() => {
    const url = clip?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [clip])

  async function start() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      // 24 kbps keeps a minute of speech to roughly 180 KB.
      const recorder = new MediaRecorder(stream, { mimeType: pickType(), audioBitsPerSecond: 24000 })
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        setClip({ blob, url: URL.createObjectURL(blob) })
        setRecording(false)
        release()
      }
      recorderRef.current = recorder
      recorder.start()
      setSeconds(0)
      setRecording(true)
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) recorder.stop()
          return s + 1
        })
      }, 1000)
    } catch {
      setError("Couldn't use the microphone. Allow microphone access in your browser and try again.")
    }
  }

  function stop() {
    recorderRef.current?.stop()
  }

  async function send() {
    if (!clip) return
    setSending(true)
    setError(null)
    try {
      const { contentType, extension } = fileInfo(clip.blob.type)
      await addMediaPost({
        roomId,
        userId,
        kind: 'voice',
        blob: clip.blob,
        extension,
        contentType,
        caption,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send. Try again.")
      setSending(false)
    }
  }

  return (
    <PaperPanel title="record a voice note" onClose={onClose}>
      {!clip ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <button
            type="button"
            onClick={recording ? stop : start}
            aria-label={recording ? 'stop recording' : 'start recording'}
            className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95 ${
              recording ? 'animate-pulse bg-rust' : 'bg-ink-dark hover:scale-105'
            }`}
          >
            {recording ? (
              <Square size={28} fill="currentColor" aria-hidden="true" />
            ) : (
              <Mic size={30} aria-hidden="true" />
            )}
          </button>
          <p className="font-type text-sm">
            {recording ? `recording ${clock(seconds)}` : 'tap to start'}
          </p>
          <p className="font-body text-xs text-ink-dark/50">Up to {MAX_SECONDS / 60} minutes.</p>
        </div>
      ) : (
        <>
          <audio controls src={clip.url} className="w-full" />
          <button
            type="button"
            onClick={() => setClip(null)}
            className="flex items-center gap-1.5 self-start font-body text-xs text-ink-dark/60 underline"
          >
            <RotateCcw size={12} aria-hidden="true" />
            record again
          </button>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={300}
            placeholder="add a caption (optional)"
            aria-label="caption"
            className={`${paperFieldCls} pl-4 font-hand text-xl`}
          />
        </>
      )}
      <ErrorText message={error} />
      {clip && (
        <button type="button" onClick={send} disabled={sending} className={paperBtnCls}>
          <Send size={16} aria-hidden="true" />
          {sending ? 'sending…' : 'send voice note'}
        </button>
      )}
    </PaperPanel>
  )
}
