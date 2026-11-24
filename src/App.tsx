import { useEffect, useState } from 'react'
import { configured } from './lib/supabase'
import { useSession } from './lib/useSession'
import { getProfile, type Profile, type Space } from './lib/spaces'
import { AuthScreen } from './screens/AuthScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { SpacesScreen } from './screens/SpacesScreen'
import { SpaceScreen } from './screens/SpaceScreen'
import { Heading, Screen } from './ui'

function SignedIn({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const [space, setSpace] = useState<Space | null>(null)

  useEffect(() => {
    getProfile(userId)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [userId])

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

function App() {
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

export default App
