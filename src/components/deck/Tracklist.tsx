import { Music, Trash2 } from 'lucide-react'
import { Avatar } from '../../lib/avatars'
import type { Post } from '../../lib/posts'
import type { Profile } from '../../lib/spaces'
import type { DeckState } from './useDeck'

interface Props {
  deck: DeckState
  people: Map<string, Profile | null>
  userId: string
  isOwner: boolean
  onDelete: (post: Post) => void
}

export function Tracklist({ deck, people, userId, isOwner, onDelete }: Props) {
  const { tracks, currentId } = deck

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-ink-soft">
        <Music aria-hidden="true" className="text-amber" />
        <p className="font-body text-sm">The tape is blank. Dedicate a song to start it.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {tracks.map((track, i) => {
        const who = people.get(track.author_id)
        const active = track.id === currentId
        const canDelete = track.author_id === userId || isOwner
        return (
          <li key={track.id} className="relative flex items-center">
            <button
              type="button"
              onClick={() => deck.pick(track)}
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border py-2.5 pl-3 text-left transition-colors ${
                canDelete ? 'pr-12' : 'pr-3'
              } ${
                active
                  ? 'border-amber/60 bg-white/10'
                  : 'border-transparent bg-white/[0.04] hover:bg-white/[0.08]'
              } ${track.preview_url ? '' : 'opacity-60'}`}
            >
              <span
                className={`w-5 shrink-0 font-type text-xs ${active ? 'text-amber' : 'text-ink-soft'}`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {track.artwork_url ? (
                <img
                  src={track.artwork_url}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-md object-cover"
                />
              ) : (
                <span className="h-11 w-11 shrink-0 rounded-md bg-black/20" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-body text-sm font-medium text-ink">
                  {track.title}
                </span>
                <span className="block truncate font-body text-xs text-ink-soft">
                  {track.artist}
                  {track.preview_url ? '' : ' · no preview'}
                </span>
              </span>
              <Avatar id={who?.avatar ?? 'unknown'} name={who?.display_name ?? '?'} size={26} />
            </button>
            {canDelete && (
              <button
                type="button"
                aria-label={`remove ${track.title}`}
                onClick={() => onDelete(track)}
                className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white/10 hover:text-ink"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
