import { Mic, Trash2 } from 'lucide-react'
import { Avatar } from '../lib/avatars'
import type { Post } from '../lib/posts'

// Photos, voice notes and notes. Songs live on the tape deck instead.
interface CardProps {
  post: Post
  authorName: string
  authorAvatar: string
  mediaUrl?: string
  canDelete: boolean
  onDelete: () => void
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

function timeAgo(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

function Byline({
  post,
  authorName,
  authorAvatar,
  canDelete,
  onDelete,
}: Pick<CardProps, 'post' | 'authorName' | 'authorAvatar' | 'canDelete' | 'onDelete'>) {
  return (
    <div className="flex items-center gap-2 font-body text-xs text-ink-dark/60">
      <Avatar id={authorAvatar} name={authorName} size={22} />
      <span className="truncate font-medium text-ink-dark">{authorName}</span>
      <span className="shrink-0">· {timeAgo(post.created_at)}</span>
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="delete this post"
          className="ml-auto rounded-full p-1.5 text-ink-dark/40 hover:bg-ink-dark/10 hover:text-ink-dark"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export function PhotoTile(props: CardProps) {
  const { post, mediaUrl, authorName } = props
  return (
    <li className="mb-4 break-inside-avoid rounded-xl bg-paper p-3 pb-4 text-ink-dark shadow-[0_12px_26px_rgba(0,0,0,0.4)]">
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="open the full photo"
        className="block overflow-hidden rounded bg-ink-dark/10"
      >
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={post.body ?? `photo from ${authorName}`}
            loading="lazy"
            className="h-auto w-full"
          />
        ) : (
          <div className="aspect-square w-full animate-pulse" />
        )}
      </a>
      {post.body && (
        <p className="mt-2 text-center font-hand text-xl leading-snug">{post.body}</p>
      )}
      <div className="mt-2">
        <Byline {...props} />
      </div>
    </li>
  )
}

export function VoiceRow(props: CardProps) {
  const { post, mediaUrl } = props
  return (
    <li className="rounded-xl bg-paper p-4 text-ink-dark shadow-[0_12px_26px_rgba(0,0,0,0.4)]">
      <Byline {...props} />
      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/25">
          <Mic size={18} aria-hidden="true" />
        </span>
        {mediaUrl ? (
          <audio controls preload="none" src={mediaUrl} className="w-full" />
        ) : (
          <div className="h-10 w-full animate-pulse rounded-full bg-ink-dark/10" />
        )}
      </div>
      {post.body && <p className="mt-2 font-hand text-xl leading-snug">{post.body}</p>}
    </li>
  )
}

export function NoteCard(props: CardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-paper p-4 text-ink-dark shadow-[0_12px_26px_rgba(0,0,0,0.4)]">
      <Byline {...props} />
      <p className="rounded-lg bg-amber/15 px-4 py-3 font-hand text-2xl leading-snug whitespace-pre-wrap">
        {props.post.body}
      </p>
    </li>
  )
}
