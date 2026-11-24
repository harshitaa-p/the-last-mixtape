import { useMemo, useState } from 'react'
import { Check, Globe, Shuffle, User } from 'lucide-react'
import { Backdrop } from '../components/Backdrop'
import { randomSeeds } from '../lib/avatar'
import { Avatar } from '../lib/avatars'
import { saveProfile, type Profile } from '../lib/spaces'
import { ErrorText } from '../ui'

const fieldCls =
  'w-full rounded-xl border border-ink-dark/15 bg-ink-dark/5 py-3 pr-4 pl-11 font-body text-sm text-ink-dark outline-none transition-colors placeholder:text-ink-dark/40 focus:border-amber focus:bg-white'

function timezones(current: string): string[] {
  const all =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
  return all.includes(current) ? all : [current, ...all]
}

interface Props {
  userId: string
  initial: Profile | null
  onDone: (profile: Profile) => void
}

export function ProfileScreen({ userId, initial, onDone }: Props) {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [seeds, setSeeds] = useState(() => randomSeeds(12, initial?.avatar))
  const [avatar, setAvatar] = useState(seeds[0])
  const [name, setName] = useState(initial?.display_name ?? '')
  const [timezone, setTimezone] = useState(initial?.timezone ?? detected)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const zones = useMemo(() => timezones(timezone), [timezone])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const profile = { id: userId, display_name: name.trim(), avatar, timezone }
    try {
      await saveProfile(profile)
      onDone(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.")
      setBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <Backdrop />
      <div className="relative w-full max-w-md">
        <div
          aria-hidden="true"
          className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-sm bg-amber/70"
        />
        <form
          onSubmit={submit}
          className="flex flex-col gap-5 rounded-2xl bg-paper p-6 text-ink-dark shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:p-8"
        >
          <header className="text-center">
            <p className="font-type text-xs tracking-[0.3em] text-ink-dark/50 uppercase">
              who's there?
            </p>
            <h1 className="mt-1 font-hand text-5xl">your look</h1>
          </header>

          <div className="flex justify-center">
            <div className="rounded-full p-1.5 ring-4 ring-amber/80">
              <Avatar id={avatar} name={name || 'you'} size={120} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between font-body text-xs text-ink-dark/60">
              <span>pick a face</span>
              <button
                type="button"
                onClick={() => setSeeds(randomSeeds(12, avatar))}
                className="flex items-center gap-1.5 rounded-full border border-ink-dark/20 px-3 py-1.5 text-ink-dark transition-colors hover:bg-ink-dark/5"
              >
                <Shuffle size={14} aria-hidden="true" />
                shuffle
              </button>
            </div>
            <div className="grid grid-cols-4 justify-items-center gap-3 sm:grid-cols-6">
              {seeds.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  aria-label="choose this avatar"
                  aria-pressed={avatar === seed}
                  onClick={() => setAvatar(seed)}
                  className={`rounded-full p-0.5 transition-transform hover:scale-110 ${
                    avatar === seed ? 'ring-2 ring-amber ring-offset-2 ring-offset-paper' : ''
                  }`}
                >
                  <Avatar id={seed} name="avatar option" size={52} />
                </button>
              ))}
            </div>
          </div>

          <label className="relative block">
            <span className="sr-only">your name</span>
            <User
              size={18}
              aria-hidden="true"
              className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-dark/45"
            />
            <input
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="what should friends call you?"
              className={fieldCls}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-body text-xs text-ink-dark/60">
              your timezone (for the clocks)
            </span>
            <span className="relative block">
              <Globe
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-dark/45"
              />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={`${fieldCls} appearance-none`}
              >
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <ErrorText message={error} />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="flex items-center justify-center gap-2 rounded-full bg-amber py-3 font-body text-sm font-semibold text-ink-dark transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Check size={16} aria-hidden="true" />
            {busy ? 'saving…' : 'save'}
          </button>
        </form>
      </div>
    </main>
  )
}
