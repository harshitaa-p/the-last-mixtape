import { useState } from 'react'
import { Deck } from '../deck/Deck'
import { Tracklist } from '../deck/Tracklist'
import type { DeckState } from '../deck/useDeck'
import { SongSearch } from '../SongSearch'
import { ViewHeader } from './ViewHeader'
import type { ViewProps } from './types'

export function SongsView(v: ViewProps & { deck: DeckState }) {
  const [adding, setAdding] = useState(false)
  const count = v.deck.tracks.length

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(26rem,34rem)_minmax(0,1fr)] lg:items-start xl:gap-12">
      <div className="lg:sticky lg:top-6">
        <Deck deck={v.deck} people={v.people} />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <ViewHeader
          title="songs"
          subtitle={`${count} on the tape`}
          addLabel="dedicate a song"
          canAdd={v.canAdd}
          open={adding}
          onToggle={() => setAdding(!adding)}
          primary
        />
        {adding && (
          <SongSearch
            roomId={v.roomId}
            onClose={() => setAdding(false)}
            onDone={() => {
              setAdding(false)
              v.refresh()
            }}
          />
        )}
        <Tracklist
          deck={v.deck}
          people={v.people}
          userId={v.userId}
          isOwner={v.isOwner}
          onDelete={v.remove}
        />
      </div>
    </div>
  )
}
