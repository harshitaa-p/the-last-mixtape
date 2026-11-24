import { useEffect, useState } from 'react'
import { KeyRound, LogOut, Minus, Pencil, Plus, Users } from 'lucide-react'
import { useTheme } from '../lib/themes'
import { Cassette } from '../components/Cassette'
import { Avatar } from '../lib/avatars'
import { supabase } from '../lib/supabase'
import {
  createSpace,
  joinSpace,
  listSpaces,
  memberCounts,
  type Profile,
  type Space,
} from '../lib/spaces'
import { ErrorText, paperBtnCls, paperFieldCls, Screen } from '../ui'

const TAPES = [
  { body: '#c8553d', accent: '#f3c9a6' },
  { body: '#3f8f8b', accent: '#f0d58a' },
  { body: '#7a5fc0', accent: '#f4b8cf' },
  { body: '#d19a2f', accent: '#f6ecc4' },
  { body: '#b94a7c', accent: '#f6d0dd' },
  { body: '#4a74b8', accent: '#cfe0f5' },
]

// Same space always gets the same colour.
function tapeFor(id: string) {
  let hash = 5381
  for (const ch of id) hash = (hash * 33) ^ ch.charCodeAt(0)
  return TAPES[Math.abs(hash) % TAPES.length]
}

const PLANK =
  'h-3 w-[calc(100%+1rem)] rounded-sm bg-gradient-to-b from-[var(--plank-top)] to-[var(--plank-bottom)] shadow-[0_12px_16px_rgba(0,0,0,0.5)]'

interface Props {
  profile: Profile
  onOpen: (space: Space) => void
  onEditProfile: () => void
}

export function SpacesScreen({ profile, onOpen, onEditProfile }: Props) {
  const theme = useTheme()
  const [spaces, setSpaces] = useState<Space[] | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [name, setName] = useState('')
  const [size, setSize] = useState(4)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listSpaces(), memberCounts()])
      .then(([rows, byRoom]) => {
        if (cancelled) return
        setSpaces(rows)
        setCounts(byRoom)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setSpaces([])
        setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function run(action: () => Promise<Space>) {
    setBusy(true)
    setError(null)
    try {
      onOpen(await action())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setBusy(false)
    }
  }

  function focusNewSpace() {
    const field = document.getElementById('new-space-name')
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field?.focus({ preventScroll: true })
  }

  return (
    <Screen xl warm>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onEditProfile}
          className="group flex items-center gap-3 rounded-full bg-white/10 py-1.5 pr-4 pl-1.5 transition-colors hover:bg-white/15"
        >
          <Avatar id={profile.avatar} name={profile.display_name} size={40} />
          <span className="font-hand text-2xl leading-none">{profile.display_name}</span>
          <Pencil size={14} aria-hidden="true" className="text-ink-soft group-hover:text-ink" />
        </button>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-body text-xs transition-colors hover:bg-white/10"
        >
          <LogOut size={14} aria-hidden="true" />
          log out
        </button>
      </div>

      <header className="relative py-4 text-center">
        <span aria-hidden="true" className="absolute top-2 left-[10%] rotate-12 text-3xl">
          {theme.decor[0]}
        </span>
        <span aria-hidden="true" className="absolute top-10 right-[12%] -rotate-12 text-2xl">
          {theme.decor[1]}
        </span>
        <span aria-hidden="true" className="absolute bottom-0 left-[18%] -rotate-6 text-3xl">
          {theme.decor[2]}
        </span>
        <span aria-hidden="true" className="absolute right-[24%] bottom-2 rotate-6 text-xl">
          {theme.decor[3]}
        </span>
        <p className="font-type text-xs tracking-[0.3em] text-amber uppercase">welcome back</p>
        <h1 className="mt-2 font-hand text-6xl text-ink sm:text-7xl">hey, {profile.display_name}</h1>
        <p className="mt-2 font-body text-sm text-ink-soft">pick a tape from your shelf</p>
      </header>

      <section aria-label="your shelf">
        {spaces === null && (
          <p className="text-center font-type text-xs text-ink-soft">loading…</p>
        )}

        {spaces && (
          <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {spaces.map((space, i) => {
              const tape = tapeFor(space.id)
              return (
                <li key={space.id} className="flex flex-col items-center px-2">
                  <button
                    type="button"
                    onClick={() => onOpen(space)}
                    className={`group w-full max-w-[18rem] transition-transform duration-200 hover:-translate-y-2 ${
                      i % 2 === 0 ? '-rotate-2' : 'rotate-1'
                    } hover:rotate-0`}
                    aria-label={`open ${space.name}`}
                  >
                    <Cassette
                      title={space.name}
                      stripe={`SIDE ${i % 2 === 0 ? 'A' : 'B'}`}
                      body={tape.body}
                      accent={tape.accent}
                      spin="hover"
                      className="w-full drop-shadow-[0_14px_14px_rgba(0,0,0,0.45)]"
                    />
                  </button>
                  <div className={`-mt-2 ${PLANK}`} />
                  <p className="mt-3 flex items-center gap-1.5 font-body text-xs text-ink-soft">
                    <Users size={14} aria-hidden="true" />
                    {counts[space.id] ?? 1} of {space.max_members} people
                  </p>
                </li>
              )
            })}
            {/* Empty slots keep the shelf looking full, and they show where the next tape goes. */}
            {Array.from({ length: Math.max(0, 5 - spaces.length) }, (_, j) => {
              const k = spaces.length + j
              const show =
                k < 1
                  ? 'flex'
                  : k < 2
                    ? 'hidden sm:flex'
                    : k < 3
                      ? 'hidden md:flex'
                      : k < 4
                        ? 'hidden xl:flex'
                        : 'hidden 2xl:flex'
              return (
                <li key={`slot-${j}`} className={`${show} flex-col items-center px-2`}>
                  <button
                    type="button"
                    onClick={focusNewSpace}
                    className="flex aspect-[8/5] w-full max-w-[18rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 text-ink-soft transition-colors hover:border-amber/60 hover:text-ink"
                  >
                    <Plus aria-hidden="true" />
                    <span className="font-body text-xs">
                      {spaces.length === 0 && j === 0 ? 'your first tape goes here' : 'room for another tape'}
                    </span>
                  </button>
                  <div className={`-mt-2 ${PLANK}`} />
                  <div className="mt-3 h-4" aria-hidden="true" />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <h2 className="mt-4 text-center font-hand text-4xl text-ink">add to the shelf</h2>

      <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            run(() => createSpace(name, size))
          }}
          className="relative -rotate-1 overflow-hidden rounded-xl bg-paper pt-7 pr-6 pb-6 pl-12 text-ink-dark shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent 0 31px, rgba(58,44,34,0.09) 31px 32px)',
          }}
        >
          <div aria-hidden="true" className="absolute inset-y-0 left-9 w-px bg-rust/40" />
          <div aria-hidden="true" className="absolute top-2 left-0 flex w-full justify-around px-6">
            {Array.from({ length: 8 }, (_, n) => (
              <span key={n} className="h-3 w-3 rounded-full bg-[var(--room-bg)] shadow-inner" />
            ))}
          </div>
          <h3 className="font-hand text-3xl">start a new space</h3>
          <p className="mt-1 mb-3 font-body text-xs text-ink-dark/60">
            Name it, then share the code with your people.
          </p>
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="e.g. Besties, Trio, College gang"
              id="new-space-name"
              aria-label="space name"
              className={paperFieldCls.replace('pl-11', 'pl-4')}
            />
            <div className="flex items-center justify-between rounded-xl border border-ink-dark/15 bg-white/70 px-4 py-2">
              <span className="font-body text-sm">up to {size} people</span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="fewer people"
                  disabled={size <= 2}
                  onClick={() => setSize(size - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-dark/20 hover:bg-ink-dark/10 disabled:opacity-30"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="more people"
                  disabled={size >= 10}
                  onClick={() => setSize(size + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-dark/20 hover:bg-ink-dark/10 disabled:opacity-30"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </span>
            </div>
            <button type="submit" disabled={busy || !name.trim()} className={paperBtnCls}>
              <Plus size={16} aria-hidden="true" />
              create space
            </button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            run(() => joinSpace(code))
          }}
          className="relative flex rotate-1 flex-col rounded-xl bg-[color-mix(in_srgb,var(--color-amber)_32%,var(--color-paper))] px-7 py-6 text-ink-dark shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        >
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--room-bg)]"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--room-bg)]"
          />
          <p className="font-type text-[10px] tracking-[0.35em] text-ink-dark/60 uppercase">
            admit one
          </p>
          <h3 className="font-hand text-3xl">join with a code</h3>
          <p className="mt-1 font-body text-xs text-ink-dark/65">
            Got a 6-letter code from a friend? Type it here.
          </p>
          <div className="my-4 border-t-2 border-dashed border-ink-dark/25" />
          <div className="relative">
            <KeyRound
              size={18}
              aria-hidden="true"
              className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-dark/45"
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="K7X92P"
              aria-label="invite code"
              className={`${paperFieldCls} bg-white/70 font-type tracking-[0.3em]`}
            />
          </div>
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className={`${paperBtnCls} mt-3`}
          >
            <KeyRound size={16} aria-hidden="true" />
            join space
          </button>
        </form>
      </div>
      <ErrorText message={error} />
    </Screen>
  )
}
