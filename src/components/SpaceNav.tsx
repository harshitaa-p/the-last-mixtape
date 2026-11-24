import { Camera, Film, Mic, Music, Pause, Play, ScrollText, Users } from 'lucide-react'
import type { DeckState } from './deck/useDeck'

export type ViewKey = 'song' | 'photo' | 'booth' | 'voice' | 'note' | 'people'

const ITEMS: { key: ViewKey; label: string; icon: typeof Music; counted: boolean }[] = [
  { key: 'song', label: 'songs', icon: Music, counted: true },
  { key: 'photo', label: 'photos', icon: Camera, counted: true },
  { key: 'booth', label: 'photo booth', icon: Film, counted: false },
  { key: 'voice', label: 'voice notes', icon: Mic, counted: true },
  { key: 'note', label: 'notes', icon: ScrollText, counted: true },
  { key: 'people', label: 'people', icon: Users, counted: true },
]

export function SpaceNav({
  view,
  onSelect,
  counts,
  deck,
}: {
  view: ViewKey
  onSelect: (view: ViewKey) => void
  counts: Record<ViewKey, number>
  deck: DeckState
}) {
  const { current, isPlaying } = deck
  return (
    <div className="flex min-w-0 flex-col gap-4 md:sticky md:top-6">
      <nav
        aria-label="space sections"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0"
      >
        {ITEMS.map(({ key, label, icon: Icon, counted }) => (
          <button
            key={key}
            type="button"
            aria-current={view === key ? 'page' : undefined}
            onClick={() => onSelect(key)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 font-body text-sm transition-colors md:w-full ${
              view === key
                ? 'bg-paper font-medium text-ink-dark'
                : 'border border-white/10 text-ink-soft hover:bg-white/10 hover:text-ink md:border-transparent'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="md:flex-1 md:text-left">{label}</span>
            {counted && (
              <span className={`font-type text-xs ${view === key ? 'text-ink-dark/60' : 'opacity-70'}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </nav>

      {current && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
          <button
            type="button"
            onClick={() => onSelect('song')}
            aria-label="open the player"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            {current.artwork_url ? (
              <img src={current.artwork_url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
            ) : (
              <span className="h-10 w-10 shrink-0 rounded-md bg-black/20" />
            )}
            <span className="min-w-0">
              <span className="block truncate font-body text-xs font-medium text-ink">
                {current.title}
              </span>
              <span className="block truncate font-body text-[11px] text-ink-soft">
                {current.artist}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={deck.toggle}
            aria-label={isPlaying ? 'pause' : 'play'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber text-ink-dark"
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={16} fill="currentColor" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
