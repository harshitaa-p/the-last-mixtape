import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { CornerTabs } from '../components/CornerTabs'
import { useDeck } from '../components/deck/useDeck'
import { SpaceNav, type ViewKey } from '../components/SpaceNav'
import { BoothView } from '../components/views/BoothView'
import { NotesView } from '../components/views/NotesView'
import { PeopleView } from '../components/views/PeopleView'
import { PhotosView } from '../components/views/PhotosView'
import { SongsView } from '../components/views/SongsView'
import { VoiceView } from '../components/views/VoiceView'
import type { ViewProps } from '../components/views/types'
import { spaceStreak } from '../lib/streak'
import { usePosts } from '../lib/usePosts'
import { listMembers, type Member, type Space } from '../lib/spaces'
import { ErrorText, Screen } from '../ui'

interface Props {
  space: Space
  userId: string
  onBack: () => void
}

export function SpaceScreen({ space: initial, userId, onBack }: Props) {
  const [space, setSpace] = useState(initial)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [membersReload, setMembersReload] = useState(0)
  const [view, setView] = useState<ViewKey>('song')
  const [corner, setCorner] = useState<'all' | string>('all')
  const [error, setError] = useState<string | null>(null)
  const data = usePosts(space.id)

  const streak = spaceStreak(data.posts?.map((p) => p.created_at) ?? [])
  const isOwner = members?.some((m) => m.user_id === userId && m.role === 'owner') ?? false
  const people = new Map(members?.map((m) => [m.user_id, m.profile]))
  const shown = data.posts?.filter((p) => corner === 'all' || p.author_id === corner) ?? []
  const songs = shown.filter((p) => p.kind === 'song')
  const deck = useDeck(songs)
  const viewingOther = corner !== 'all' && corner !== userId
  const owner = corner === 'all' ? null : people.get(corner)

  useEffect(() => {
    let cancelled = false
    listMembers(space.id)
      .then((rows) => !cancelled && setMembers(rows))
      .catch((err: Error) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [space.id, membersReload])

  const counts: Record<ViewKey, number> = {
    song: songs.length,
    photo: shown.filter((p) => p.kind === 'photo').length,
    voice: shown.filter((p) => p.kind === 'voice').length,
    note: shown.filter((p) => p.kind === 'note').length,
    booth: 0,
    people: members?.length ?? 0,
  }

  const v: ViewProps = {
    roomId: space.id,
    userId,
    isOwner,
    people,
    posts: shown,
    urls: data.urls,
    canAdd: !viewingOther,
    loading: data.posts === null,
    refresh: data.refresh,
    remove: data.remove,
  }

  return (
    <Screen warm xl>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 font-body text-xs transition-colors hover:bg-white/10"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        all spaces
      </button>

      <header>
        <p className="font-type text-xs tracking-[0.3em] text-amber uppercase">your space</p>
        <h1 className="mt-1 font-hand text-5xl text-ink sm:text-6xl">{space.name}</h1>
        {data.posts && (
          <p
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-body text-sm"
            title="Days in a row that someone in this space added something"
          >
            <span aria-hidden="true">{streak.days > 0 ? '🔥' : '🌱'}</span>
            {streak.days > 0
              ? `${streak.days} day${streak.days > 1 ? 's' : ''} in a row`
              : 'no streak yet'}
            <span className="text-ink-soft">
              · {streak.doneToday ? "you've kept it going today" : 'add something today to keep it'}
            </span>
          </p>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-[13.5rem_minmax(0,1fr)] md:items-start md:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-14">
        <SpaceNav view={view} onSelect={setView} counts={counts} deck={deck} />

        <main className="flex min-w-0 flex-col gap-6">
          {view === 'booth' ? (
            <BoothView {...v} canAdd />
          ) : view === 'people' ? (
            <PeopleView
              space={space}
              setSpace={setSpace}
              members={members}
              userId={userId}
              isOwner={isOwner}
              onMembersChanged={() => setMembersReload((n) => n + 1)}
              onLeft={onBack}
            />
          ) : (
            <>
              <CornerTabs members={members} userId={userId} corner={corner} onChange={setCorner} />
              {viewingOther && (
                <p className="font-body text-sm text-ink-soft">
                  You're looking at {owner?.display_name ?? 'their'}'s corner. To add something of
                  your own, open{' '}
                  <button type="button" onClick={() => setCorner(userId)} className="underline">
                    my corner
                  </button>
                  .
                </p>
              )}
              {view === 'song' && <SongsView {...v} deck={deck} />}
              {view === 'photo' && <PhotosView {...v} />}
              {view === 'voice' && <VoiceView {...v} />}
              {view === 'note' && <NotesView {...v} />}
            </>
          )}
          <ErrorText message={error ?? data.error} />
        </main>
      </div>
    </Screen>
  )
}
