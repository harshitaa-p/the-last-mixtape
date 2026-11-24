import { useState } from 'react'
import { Check, Copy, DoorOpen, RefreshCw, UserMinus } from 'lucide-react'
import { Avatar } from '../../lib/avatars'
import { leaveSpace, removeMember, resetCode, type Member, type Space } from '../../lib/spaces'
import { ErrorText, paperGhostBtnCls } from '../../ui'

interface Props {
  space: Space
  setSpace: (space: Space) => void
  members: Member[] | null
  userId: string
  isOwner: boolean
  onMembersChanged: () => void
  onLeft: () => void
}

export function PeopleView({
  space,
  setSpace,
  members,
  userId,
  isOwner,
  onMembersChanged,
  onLeft,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function act(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(space.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3">
        <h2 className="font-hand text-5xl leading-none text-ink">people</h2>
        <section className="relative mt-4 rounded-2xl bg-paper p-6 text-center text-ink-dark shadow-[0_18px_40px_rgba(0,0,0,0.4)]">
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 rounded-sm bg-amber/70"
          />
          <p className="font-type text-[10px] tracking-[0.3em] text-ink-dark/50 uppercase">
            invite code
          </p>
          <p className="mt-2 font-type text-4xl tracking-[0.3em]">
            {space.code_enabled ? space.join_code : 'off'}
          </p>
          <p className="mt-1 font-body text-xs text-ink-dark/60">
            {space.code_enabled
              ? 'Share this with the people you want in this space.'
              : 'Joining is switched off. Make a new code to open it again.'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {space.code_enabled && (
              <button type="button" onClick={copyCode} className={paperGhostBtnCls}>
                <span className="flex items-center gap-1.5">
                  {copied ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <Copy size={14} aria-hidden="true" />
                  )}
                  {copied ? 'copied' : 'copy code'}
                </span>
              </button>
            )}
            {isOwner && (
              <>
                <button
                  type="button"
                  className={paperGhostBtnCls}
                  onClick={() =>
                    act(async () => {
                      const code = await resetCode(space.id, true)
                      setSpace({ ...space, join_code: code, code_enabled: true })
                    })
                  }
                >
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={14} aria-hidden="true" />
                    new code
                  </span>
                </button>
                {space.code_enabled && (
                  <button
                    type="button"
                    className={paperGhostBtnCls}
                    onClick={() =>
                      act(async () => {
                        const code = await resetCode(space.id, false)
                        setSpace({ ...space, join_code: code, code_enabled: false })
                      })
                    }
                  >
                    turn off
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4 lg:pt-16">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-3 font-type text-xs tracking-[0.25em] text-ink-soft uppercase">
            members {members ? `${members.length} of ${space.max_members}` : ''}
          </p>
          <ul className="flex flex-col gap-2">
            {members?.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2"
              >
                <Avatar
                  id={m.profile?.avatar ?? 'unknown'}
                  name={m.profile?.display_name ?? '?'}
                  size={40}
                />
                <span className="flex-1 font-body text-sm">
                  {m.profile?.display_name ?? 'someone'}
                  {m.user_id === userId && <span className="ml-2 text-xs text-ink-soft">you</span>}
                </span>
                {m.role === 'owner' && (
                  <span className="rounded-full bg-amber/20 px-2.5 py-0.5 font-body text-[11px] text-amber">
                    owner
                  </span>
                )}
                {isOwner && m.user_id !== userId && (
                  <button
                    type="button"
                    aria-label={`remove ${m.profile?.display_name ?? 'member'}`}
                    className="rounded-full p-2 text-ink-soft transition-colors hover:bg-white/10 hover:text-ink"
                    onClick={() =>
                      act(async () => {
                        await removeMember(space.id, m.user_id)
                        onMembersChanged()
                      })
                    }
                  >
                    <UserMinus size={16} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {members?.length === 1 && (
            <p className="mt-3 text-center font-body text-sm text-ink-soft">
              Waiting for a friend. Share the code.
            </p>
          )}
        </section>

        <ErrorText message={error} />
        <button
          type="button"
          className="flex items-center gap-2 self-start rounded-full px-4 py-2 font-body text-xs text-ink-soft transition-colors hover:bg-white/10 hover:text-ink"
          onClick={() =>
            act(async () => {
              await leaveSpace(space.id)
              onLeft()
            })
          }
        >
          <DoorOpen size={14} aria-hidden="true" />
          leave this space
        </button>
      </div>
    </div>
  )
}
