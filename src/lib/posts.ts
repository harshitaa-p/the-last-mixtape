import { supabase } from './supabase'
import type { SongResult } from './itunes'

export type PostKind = 'song' | 'photo' | 'voice' | 'note'

export interface Post {
  id: string
  room_id: string
  author_id: string
  kind: PostKind
  title: string | null
  artist: string | null
  artwork_url: string | null
  preview_url: string | null
  store_url: string | null
  body: string | null
  media_path: string | null
  created_at: string
}

const BUCKET = 'media'

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function listPosts(roomId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
  fail(error)
  return (data ?? []) as Post[]
}

export async function addSongPost(roomId: string, song: SongResult, note: string) {
  const { error } = await supabase.from('posts').insert({
    room_id: roomId,
    kind: 'song',
    title: song.title,
    artist: song.artist,
    artwork_url: song.artwork_url,
    preview_url: song.preview_url,
    store_url: song.store_url,
    body: note.trim() || null,
  })
  fail(error)
}

export async function addNotePost(roomId: string, body: string) {
  const { error } = await supabase
    .from('posts')
    .insert({ room_id: roomId, kind: 'note', body: body.trim() })
  fail(error)
}

// Uploads a photo or voice note, then records it. If recording fails, the file is cleaned up.
export async function addMediaPost(input: {
  roomId: string
  userId: string
  kind: 'photo' | 'voice'
  blob: Blob
  extension: string
  contentType: string
  caption: string
}) {
  const path = `${input.roomId}/${input.userId}/${crypto.randomUUID()}.${input.extension}`
  const upload = await supabase.storage
    .from(BUCKET)
    .upload(path, input.blob, { contentType: input.contentType })
  fail(upload.error)
  const { error } = await supabase.from('posts').insert({
    room_id: input.roomId,
    kind: input.kind,
    media_path: path,
    body: input.caption.trim() || null,
  })
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(error.message)
  }
}

export async function removePost(post: Post) {
  const { error } = await supabase.from('posts').delete().eq('id', post.id)
  fail(error)
  if (post.media_path) await supabase.storage.from(BUCKET).remove([post.media_path])
}

// Temporary (one hour) links to private files.
export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600)
  fail(error)
  const urls: Record<string, string> = {}
  for (const item of data ?? []) if (item.path && item.signedUrl) urls[item.path] = item.signedUrl
  return urls
}

// Calls onChange whenever a post in this space is added or removed.
export function watchPosts(roomId: string, onChange: () => void) {
  const channel = supabase
    .channel(`posts-${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts', filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
