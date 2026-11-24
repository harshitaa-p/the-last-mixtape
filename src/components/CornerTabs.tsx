import { Avatar } from '../lib/avatars'
import type { Member } from '../lib/spaces'

// Filter every screen by person: everyone, or one person's corner.
export function CornerTabs({
  members,
  userId,
  corner,
  onChange,
}: {
  members: Member[] | null
  userId: string
  corner: 'all' | string
  onChange: (corner: 'all' | string) => void
}) {
  const base = 'rounded-full font-body text-xs transition-colors'
  const on = 'bg-paper font-medium text-ink-dark'
  const off = 'border border-white/15 text-ink-soft hover:text-ink'
  return (
    <div role="tablist" aria-label="whose posts" className="flex flex-wrap gap-2">
      <button
        type="button"
        role="tab"
        aria-selected={corner === 'all'}
        onClick={() => onChange('all')}
        className={`${base} px-4 py-2 ${corner === 'all' ? on : off}`}
      >
        everyone
      </button>
      {members?.map((m) => (
        <button
          key={m.user_id}
          type="button"
          role="tab"
          aria-selected={corner === m.user_id}
          onClick={() => onChange(m.user_id)}
          className={`${base} flex items-center gap-2 py-1.5 pr-4 pl-1.5 ${
            corner === m.user_id ? on : off
          }`}
        >
          <Avatar id={m.profile?.avatar ?? 'unknown'} name={m.profile?.display_name ?? '?'} size={26} />
          {m.user_id === userId ? 'my corner' : (m.profile?.display_name ?? 'someone')}
        </button>
      ))}
    </div>
  )
}
