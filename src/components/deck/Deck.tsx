import { useState } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { fullSongLinks } from '../../lib/itunes'
import { BrandIcon } from '../BrandIcon'
import type { Profile } from '../../lib/spaces'
import { CassetteView } from './CassetteView'
import { DeckButton } from './pieces'
import type { DeckState } from './useDeck'
import { VinylView } from './VinylView'

interface Props {
  deck: DeckState
  people: Map<string, Profile | null>
}

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function Deck({ deck, people }: Props) {
  const [view, setView] = useState<'cassette' | 'vinyl'>('cassette')
  const { current, tracks, isPlaying, progress, time, duration, playable, side } = deck
  const author = current ? people.get(current.author_id) : null
  const links = current
    ? fullSongLinks(current.title ?? '', current.artist ?? '', current.store_url)
    : []

  return (
    <section
      aria-label="tape deck"
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-type text-[11px] tracking-[0.25em] text-ink-soft uppercase">
          now playing
        </p>
        <div
          role="tablist"
          aria-label="view"
          className="flex rounded-full border border-white/10 p-0.5 font-body text-xs"
        >
          {(['cassette', 'vinyl'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 transition-colors ${
                view === v ? 'bg-paper font-medium text-ink-dark' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[22rem] xl:max-w-[26rem]">
        {view === 'cassette' ? (
          <CassetteView
            isPlaying={isPlaying}
            progress={progress}
            title={current?.title ?? null}
            side={side}
          />
        ) : (
          <VinylView
            isPlaying={isPlaying}
            title={current?.title ?? null}
            side={side}
            artwork={current?.artwork_url ?? null}
          />
        )}
      </div>

      <div className="mt-5 text-center">
        <p className="truncate font-body text-base font-semibold text-ink">
          {current ? current.title : 'Pick a track'}
        </p>
        <p className="truncate font-body text-sm text-ink-soft">
          {current
            ? `${current.artist}${author ? ` · from ${author.display_name}` : ''}`
            : tracks.length === 0
              ? 'No songs yet. Dedicate the first one.'
              : '30-second previews play here'}
        </p>
      </div>

      <div
        role="slider"
        aria-label="seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(time)}
        tabIndex={0}
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect()
          deck.seek((e.clientX - box.left) / box.width)
        }}
        className="mt-4 h-1.5 cursor-pointer rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-amber"
          style={{ width: `${progress * 100}%`, transition: 'width 0.25s linear' }}
        />
      </div>
      <div className="mt-1 flex justify-between font-type text-[10px] text-ink-soft">
        <span>{clock(time)}</span>
        <span>{duration > 0 ? clock(duration) : '0:30'}</span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <DeckButton
          aria-label="previous track"
          onClick={() => deck.step(-1)}
          disabled={playable.length === 0}
        >
          <SkipBack size={18} aria-hidden="true" />
        </DeckButton>
        <DeckButton
          aria-label={isPlaying ? 'pause' : 'play'}
          active={isPlaying}
          onClick={deck.toggle}
          disabled={playable.length === 0}
          className="h-12 w-20"
        >
          {isPlaying ? (
            <Pause size={22} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={22} fill="currentColor" aria-hidden="true" />
          )}
        </DeckButton>
        <DeckButton
          aria-label="next track"
          onClick={() => deck.step(1)}
          disabled={playable.length === 0}
        >
          <SkipForward size={18} aria-hidden="true" />
        </DeckButton>
      </div>

      {deck.error && <p className="mt-2 text-center font-body text-xs text-rust">{deck.error}</p>}

      {current?.body && (
        <p className="mt-5 border-l-2 border-amber/70 pl-4 font-hand text-2xl leading-snug whitespace-pre-wrap text-ink">
          {current.body}
        </p>
      )}

      {current && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-body text-xs text-ink-soft">
          <span>Full song:</span>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-ink transition-colors hover:bg-white/10"
            >
              <BrandIcon brand={link.brand} size={16} />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
