import { useState } from 'react'
import { Send } from 'lucide-react'
import { addNotePost } from '../lib/posts'
import { ErrorText, paperBtnCls, paperFieldCls } from '../ui'
import { PaperPanel } from './PaperPanel'

interface Props {
  roomId: string
  onDone: () => void
  onClose: () => void
}

export function NoteComposer({ roomId, onDone, onClose }: Props) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    setSending(true)
    setError(null)
    try {
      await addNotePost(roomId, body)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send. Try again.")
      setSending(false)
    }
  }

  return (
    <PaperPanel title="write a note" onClose={onClose}>
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={7}
        placeholder="a thought, a letter, something you almost didn't say…"
        aria-label="your note"
        className={`${paperFieldCls} resize-none pl-4 font-hand text-2xl leading-snug`}
      />
      <p className="text-right font-body text-xs text-ink-dark/50">{body.length} / 2000</p>
      <ErrorText message={error} />
      <button
        type="button"
        onClick={send}
        disabled={sending || !body.trim()}
        className={paperBtnCls}
      >
        <Send size={16} aria-hidden="true" />
        {sending ? 'sending…' : 'post note'}
      </button>
    </PaperPanel>
  )
}
