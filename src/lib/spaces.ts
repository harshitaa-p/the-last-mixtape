import { supabase } from './supabase'

export interface Profile {
  id: string
  display_name: string
  avatar: string
  timezone: string
}

export interface Space {
  id: string
  name: string
  join_code: string
  code_enabled: boolean
  max_members: number
  created_by: string
}

export interface Member {
  user_id: string
  role: 'owner' | 'member'
  profile: Profile | null
}

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return check(
    await supabase.from('profiles').select('*').eq('id', userId).maybeSingle<Profile>(),
  )
}

// Loads the profile. If the login has expired, it asks for a fresh one once and tries again, so
// an expired login is never mistaken for "no profile yet".
export async function loadProfile(userId: string): Promise<Profile | null> {
  try {
    return await getProfile(userId)
  } catch (err) {
    if (err instanceof Error && /jwt|expired/i.test(err.message)) {
      const { error } = await supabase.auth.refreshSession()
      if (!error) return getProfile(userId)
    }
    throw err
  }
}

export async function saveProfile(profile: Profile) {
  check(await supabase.from('profiles').upsert(profile))
}

export async function listSpaces(): Promise<Space[]> {
  const rows = check(
    await supabase.from('rooms').select('*').order('created_at', { ascending: false }),
  )
  return (rows ?? []) as Space[]
}

// How many people are in each of my spaces, keyed by space id.
export async function memberCounts(): Promise<Record<string, number>> {
  const rows = check(await supabase.from('room_members').select('room_id')) as {
    room_id: string
  }[]
  const counts: Record<string, number> = {}
  for (const { room_id } of rows ?? []) counts[room_id] = (counts[room_id] ?? 0) + 1
  return counts
}

export async function createSpace(name: string, size: number): Promise<Space> {
  return check(await supabase.rpc('create_room', { room_name: name, size }))
}

export async function joinSpace(code: string): Promise<Space> {
  return check(await supabase.rpc('join_room', { code }))
}

export async function leaveSpace(roomId: string) {
  check(await supabase.rpc('leave_room', { rid: roomId }))
}

export async function removeMember(roomId: string, userId: string) {
  check(await supabase.rpc('remove_member', { rid: roomId, uid: userId }))
}

export async function resetCode(roomId: string, enabled = true): Promise<string> {
  return check(await supabase.rpc('reset_join_code', { rid: roomId, enabled }))
}

export async function listMembers(roomId: string): Promise<Member[]> {
  const rows = check(
    await supabase.from('room_members').select('user_id, role').eq('room_id', roomId),
  ) as { user_id: string; role: 'owner' | 'member' }[]
  const profiles = check(
    await supabase
      .from('profiles')
      .select('*')
      .in(
        'id',
        rows.map((r) => r.user_id),
      ),
  ) as Profile[]
  const byId = new Map(profiles.map((p) => [p.id, p]))
  return rows.map((r) => ({ ...r, profile: byId.get(r.user_id) ?? null }))
}
