import type { Post } from '../../lib/posts'
import type { Profile } from '../../lib/spaces'

// What every screen of a space receives. `posts` is already filtered to the chosen person.
export interface ViewProps {
  roomId: string
  userId: string
  isOwner: boolean
  people: Map<string, Profile | null>
  posts: Post[]
  urls: Record<string, string>
  canAdd: boolean
  loading: boolean
  refresh: () => void
  remove: (post: Post) => void
}

// Props shared by the photo, voice and note cards.
export function cardProps(post: Post, v: ViewProps) {
  const author = v.people.get(post.author_id)
  return {
    post,
    authorName: author?.display_name ?? 'someone',
    authorAvatar: author?.avatar ?? 'unknown',
    mediaUrl: post.media_path ? v.urls[post.media_path] : undefined,
    canDelete: post.author_id === v.userId || v.isOwner,
    onDelete: () => v.remove(post),
  }
}
