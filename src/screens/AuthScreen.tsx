import { useState } from 'react'
import { Camera, Eye, EyeOff, Lock, Mail, Mic, Music, Play, ScrollText } from 'lucide-react'
import { Cassette } from '../components/Cassette'
import { supabase } from '../lib/supabase'
import { ErrorText } from '../ui'

const fieldCls =
  'w-full rounded-xl border border-ink-dark/15 bg-ink-dark/5 py-3 pr-4 pl-11 font-body text-sm text-ink-dark outline-none transition-colors placeholder:text-ink-dark/40 focus:border-amber focus:bg-white'

const FEATURES = [
  { icon: Music, label: 'songs' },
  { icon: Mic, label: 'voice notes' },
  { icon: ScrollText, label: 'letters' },
  { icon: Camera, label: 'photos' },
]

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) setNotice('Check your email to confirm your account, then log in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function google() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  async function forgot() {
    if (!email) return setError('Enter your email first.')
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) setError(error.message)
    else setNotice('Password reset link sent. Check your email.')
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 30rem at 20% -10%, rgba(232,162,74,0.22), transparent 60%), radial-gradient(50rem 30rem at 100% 100%, rgba(91,143,217,0.18), transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-5xl items-center gap-10 px-6 py-10 md:grid-cols-2 md:gap-14">
        <section className="flex flex-col items-center text-center md:items-start md:text-left">
          <Cassette className="float w-44 drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)] sm:w-64 md:w-full md:max-w-sm" />
          <p className="mt-5 font-type text-xs tracking-[0.3em] text-amber uppercase md:mt-8">
            the last mixtape
          </p>
          <h1 className="mt-2 font-hand text-4xl leading-[1.05] text-ink sm:text-5xl md:mt-3 md:text-6xl">
            songs for the people
            <br />
            far from you
          </h1>
          <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-ink-soft md:mt-4">
            A private space for you and your favourite people. Dedicate a song, leave a voice note,
            keep the letters.
          </p>
          <ul className="mt-4 hidden flex-wrap justify-center gap-2 sm:flex md:mt-5 md:justify-start">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-body text-xs text-ink"
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </section>

        <section className="relative mx-auto w-full max-w-sm md:mx-0 md:ml-auto">
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rotate-2 rounded-sm bg-amber/70"
          />
          <div className="rounded-2xl bg-paper p-6 text-ink-dark shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="grid grid-cols-2 rounded-full bg-ink-dark/8 p-1 font-body text-sm">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setError(null)
                    setNotice(null)
                  }}
                  className={`rounded-full py-2 transition-colors ${
                    mode === m ? 'bg-ink-dark text-paper' : 'text-ink-dark/60 hover:text-ink-dark'
                  }`}
                >
                  {m === 'login' ? 'log in' : 'sign up'}
                </button>
              ))}
            </div>

            <h2 className="mt-6 font-hand text-4xl">
              {mode === 'login' ? 'welcome back' : 'make your tape'}
            </h2>
            <p className="mt-1 font-body text-sm text-ink-dark/60">
              {mode === 'login' ? 'Pick up where you left off.' : 'Takes less than a minute.'}
            </p>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
              <div className="relative">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-dark/45"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  autoComplete="email"
                  className={fieldCls}
                />
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  aria-hidden="true"
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-dark/45"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password (6+ characters)"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'hide password' : 'show password'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-dark/50 hover:text-ink-dark"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={forgot}
                  className="self-end font-body text-xs text-ink-dark/60 underline hover:text-ink-dark"
                >
                  forgot password?
                </button>
              )}

              <ErrorText message={error} />
              {notice && <p className="font-body text-xs text-ink-dark/70">{notice}</p>}

              <button
                type="submit"
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-full bg-amber py-3 font-body text-sm font-semibold text-ink-dark transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Play size={16} fill="currentColor" aria-hidden="true" />
                {busy ? 'one sec…' : mode === 'login' ? 'log in' : 'create account'}
              </button>

              <div className="flex items-center gap-3 font-body text-xs text-ink-dark/40">
                <span className="h-px flex-1 bg-ink-dark/15" />
                or
                <span className="h-px flex-1 bg-ink-dark/15" />
              </div>

              <button
                type="button"
                onClick={google}
                className="rounded-full border border-ink-dark/20 py-3 font-body text-sm text-ink-dark transition-colors hover:bg-ink-dark/5"
              >
                continue with Google
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
