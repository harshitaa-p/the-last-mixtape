import { Reel, Screw, WriteProtectTab } from './pieces'

interface Props {
  isPlaying: boolean
  progress: number
  title: string | null
  side: 'A' | 'B'
}

export function CassetteView({ isPlaying, progress, title, side }: Props) {
  return (
    <div
      className="relative flex aspect-[12/5] w-full flex-col gap-0.5 rounded-lg p-1.5"
      style={{
        background: 'linear-gradient(160deg, #3a3229 0%, #221c16 60%, #0f0c0a 100%)',
        boxShadow: isPlaying
          ? '0 4px 12px rgba(0,0,0,0.5) inset, 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1.5px color-mix(in srgb, var(--color-amber) 55%, transparent), 0 0 22px -2px color-mix(in srgb, var(--color-amber) 55%, transparent)'
          : '0 4px 12px rgba(0,0,0,0.5) inset, 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-60"
        style={{
          background:
            'linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      <div className="relative flex items-center justify-between px-1">
        <p className="font-type text-[6px] tracking-[0.2em] text-white/30 uppercase">
          type II · chrome
        </p>
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: isPlaying ? 'var(--color-amber)' : 'rgba(255,255,255,0.15)',
              boxShadow: isPlaying ? '0 0 6px 1.5px var(--color-amber)' : 'none',
              animation: isPlaying ? 'rec-pulse 1.4s ease-in-out infinite' : 'none',
            }}
          />
          <p className="font-type text-[6px] tracking-[0.2em] text-white/30 uppercase">
            {isPlaying ? 'play' : 'pause'}
          </p>
        </div>
      </div>

      <WriteProtectTab className="left-9" />
      <WriteProtectTab className="right-9" />
      <Screw className="top-1.5 left-1/2 -translate-x-1/2" />

      <div
        className="relative mx-1 -rotate-1 rounded-sm px-3 py-0.5 text-center"
        style={{
          background: 'linear-gradient(155deg, var(--color-paper), var(--color-paper-dark))',
          boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
        }}
      >
        <span
          className="absolute -top-1.5 left-3 h-3 w-6 rotate-[-8deg] rounded-[1px]"
          style={{ background: 'rgba(255,255,255,0.22)', boxShadow: '0 1px 1px rgba(0,0,0,0.15)' }}
        />
        <span
          className="absolute -top-1.5 right-3 h-3 w-6 rotate-[6deg] rounded-[1px]"
          style={{ background: 'rgba(255,255,255,0.22)', boxShadow: '0 1px 1px rgba(0,0,0,0.15)' }}
        />
        <p className="font-type text-[7px] tracking-[0.25em] text-ink-soft uppercase">
          side {side} · c90
        </p>
        <p className="mx-auto max-w-40 truncate font-hand text-base text-ink-dark sm:max-w-56">
          {title ?? 'pick a track'}
        </p>
      </div>

      <div
        className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-4 py-0.5"
        style={{
          background: 'linear-gradient(155deg, #1a1512, #0a0806)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 2px 6px rgba(0,0,0,0.5) inset',
        }}
      >
        <div
          className="pointer-events-none absolute inset-1 rounded"
          style={{
            background:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 5px)',
          }}
        />
        <div className="relative flex w-full items-center justify-between px-2">
          <div
            className="absolute top-1/2 left-1/2 h-[2px] w-[68%] -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'var(--color-tape)', opacity: 0.6 }}
          />
          <Reel spinning={isPlaying} filled={1 - progress} />
          <Reel spinning={isPlaying} filled={progress} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.7)', boxShadow: '0 1px 0 rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>

      <p className="absolute right-3 bottom-1 font-type text-[6px] tracking-widest text-white/20 uppercase">
        hi-fi stereo
      </p>
    </div>
  )
}
