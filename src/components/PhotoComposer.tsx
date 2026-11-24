import { useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus, Send } from 'lucide-react'
import { shrinkImage } from '../lib/image'
import { addMediaPost } from '../lib/posts'
import { ErrorText, paperBtnCls, paperFieldCls } from '../ui'
import { PaperPanel } from './PaperPanel'

interface Props {
  roomId: string
  userId: string
  onDone: () => void
  onClose: () => void
}

export function PhotoComposer({ roomId, userId, onDone, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  async function send() {
    if (!file) return
    setSending(true)
    setError(null)
    try {
      const blob = await shrinkImage(file)
      await addMediaPost({
        roomId,
        userId,
        kind: 'photo',
        blob,
        extension: 'jpg',
        contentType: 'image/jpeg',
        caption,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send. Try again.")
      setSending(false)
    }
  }

  return (
    <PaperPanel title="share a photo" onClose={onClose}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="choose a photo"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      {preview ? (
        <div className="rounded-xl bg-white p-3 pb-6 shadow-md">
          <img src={preview} alt="your photo" className="max-h-72 w-full rounded object-cover" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-dark/25 font-body text-sm text-ink-dark/60 transition-colors hover:bg-ink-dark/5"
        >
          <ImagePlus aria-hidden="true" />
          choose a photo
        </button>
      )}
      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="self-start font-body text-xs text-ink-dark/60 underline"
        >
          choose a different photo
        </button>
      )}
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={300}
        placeholder="add a caption (optional)"
        aria-label="caption"
        className={`${paperFieldCls} pl-4 font-hand text-xl`}
      />
      <ErrorText message={error} />
      <button type="button" onClick={send} disabled={sending || !file} className={paperBtnCls}>
        <Send size={16} aria-hidden="true" />
        {sending ? 'sending…' : 'share photo'}
      </button>
    </PaperPanel>
  )
}
