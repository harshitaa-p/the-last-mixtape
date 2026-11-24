import { useEffect, useState } from 'react'
import { configured, supabase } from './lib/supabase'
import { useSession } from './lib/useSession'
import { loadProfile, type Profile, type Space } from './lib/spaces'
import { AuthScreen } from './screens/AuthScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { SpacesScreen } from './screens/SpacesScreen'
import { SpaceScreen } from './screens/SpaceScreen'
import { ThemePicker } from './components/ThemePicker'
import { btnCls, ghostBtnCls, Heading, Screen } from './ui'

function SignedIn({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false)
  const [space, setSpace] = useState<Space | null>(null)

  useEffect(() => {
    let cancelled = false
    loadProfile(userId)
      .then((p) => !cancelled && setProfile(p))
      .catch((err: Error) => !cancelled && setLoadError(err.message))
    return () => {
      cancelled = true
    }
  }, [userId, attempt])

  if (loadError) {
    return (
      <Screen>
        <Heading eyebrow="hold on" title="couldn't load you" />
        <p className="text-center font-body text-sm text-ink-soft">
          {/jwt|expired/i.test(loadError)
            ? 'Your login has expired. Log out and sign in again.'
            : 'Something went wrong while loading your account. Check your connection and try again.'}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            className={btnCls}
            onClick={() => {
              setLoadError(null)
              setProfile(undefined)
              setAttempt((n) => n + 1)
            }}
          >
            try again
          </button>
          <button type="button" className={ghostBtnCls} onClick={() => supabase.auth.signOut()}>
            log out
          </button>
        </div>
      </Screen>
    )
  }
  if (profile === undefined) return null
  if (!profile || editing) {
    return (
      <ProfileScreen
        userId={userId}
        initial={profile}
        onDone={(p) => {
          setProfile(p)
          setEditing(false)
        }}
      />
    )
  }
  if (space) return <SpaceScreen space={space} userId={userId} onBack={() => setSpace(null)} />
  return <SpacesScreen profile={profile} onOpen={setSpace} onEditProfile={() => setEditing(true)} />
}

function Routes() {
  const session = useSession()

  if (!configured) {
    return (
      <Screen>
        <Heading eyebrow="setup needed" title="almost there" />
        <p className="text-center font-body text-sm text-ink-soft">
          Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase URL and anon
          key, then restart the dev server.
        </p>
      </Screen>
    )
  }
  if (session === undefined) return null
  if (!session) return <AuthScreen />
  return <SignedIn key={session.user.id} userId={session.user.id} />
}

function App() {
  return (
    <>
      <Routes />
      <ThemePicker />
    </>
  )
}

export default App
