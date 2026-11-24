interface Props {
  isPlaying: boolean
  progress: number
  title: string | null
  side: 'A' | 'B'
}

function Screw({ style }: { style: React.CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className="absolute h-3 w-3 rounded-full"
      style={{
        background: 'radial-gradient(circle at 32% 28%, #d8d2c8, #6d665d 55%, #2b2620 100%)',
        boxShadow: '0 1px 1px rgba(255,255,255,0.12), 0 2px 2px rgba(0,0,0,0.8)',
        ...style,
      }}
    >
      <span className="absolute top-1/2 left-1/2 h-[1.5px] w-2 -translate-x-1/2 -translate-y-1/2 rotate-[35deg] bg-black/65" />
    </span>
  )
}

// A round reel: a spool of tape (its size follows the song) around a toothed plastic hub.
// Everything inside `spin` rolls round while the song plays.
function Reel({ pack, spinning }: { pack: number; spinning: boolean }) {
  const size = `${Math.round((0.52 + pack * 0.48) * 100)}%`
  return (
    <div className="relative aspect-square h-full">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.1)',
          background: '#0b0908',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ animation: spinning ? 'vinyl-spin 2.2s linear infinite' : 'none' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size,
            height: size,
            background: [
              'conic-gradient(from 0deg, rgba(255,255,255,0.28) 0 6%, transparent 6% 46%, rgba(255,255,255,0.18) 46% 53%, transparent 53% 100%)',
              'repeating-radial-gradient(circle, #4a3a2e 0px, #4a3a2e 1.5px, #2e231b 1.5px, #2e231b 3px)',
            ].join(', '),
            boxShadow: '0 1px 3px rgba(0,0,0,0.7)',
            transition: 'width 0.6s linear, height 0.6s linear',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #f4efe6, #b9b2a6 70%, #8d867a)',
            boxShadow: '0 0 0 2px #0d0a08, 0 2px 4px rgba(0,0,0,0.7)',
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span
              key={deg}
              className="absolute top-1/2 left-1/2 h-[16%] w-[10%] rounded-[1px] bg-[#16110d]"
              style={{
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-175%)`,
              }}
            />
          ))}
          <span className="absolute top-1/2 left-1/2 aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0d0a08]" />
        </div>
      </div>
    </div>
  )
}

export function CassetteView({ isPlaying, progress, title, side }: Props) {
  return (
    <div className="py-3">
      <div
        className="relative mx-auto aspect-[8/5] w-full rounded-2xl"
        style={{
          background: 'linear-gradient(150deg, #5a4d41 0%, #342b24 42%, #1a1410 100%)',
          boxShadow: [
            'inset 0 2px 0 rgba(255,255,255,0.28)',
            'inset 2px 0 0 rgba(255,255,255,0.1)',
            'inset -2px 0 0 rgba(0,0,0,0.45)',
            'inset 0 -4px 6px rgba(0,0,0,0.55)',
            '0 2px 0 #120e0b',
            '0 5px 0 #0d0a08',
            '0 8px 0 #090706',
            '0 20px 26px -4px rgba(0,0,0,0.7)',
            isPlaying
              ? '0 0 34px -4px color-mix(in srgb, var(--color-amber) 55%, transparent)'
              : '0 0 0 transparent',
          ].join(', '),
          transition: 'box-shadow 0.4s ease',
        }}
      >
        <Screw style={{ top: 10, left: 10 }} />
        <Screw style={{ top: 10, right: 10 }} />
        <Screw style={{ bottom: 10, left: 10 }} />
        <Screw style={{ bottom: 10, right: 10 }} />
        <Screw style={{ top: 10, left: '50%', marginLeft: -6 }} />

        <p className="absolute top-[3.2%] left-[11%] font-type text-[7px] tracking-[0.25em] text-white/35 uppercase">
          type II · chrome
        </p>
        <div className="absolute top-[3%] right-[11%] flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: isPlaying ? 'var(--color-amber)' : 'rgba(255,255,255,0.18)',
              boxShadow: isPlaying ? '0 0 8px 2px var(--color-amber)' : 'none',
              animation: isPlaying ? 'rec-pulse 1.4s ease-in-out infinite' : 'none',
            }}
          />
          <p className="font-type text-[7px] tracking-[0.25em] text-white/35 uppercase">
            {isPlaying ? 'play' : 'stop'}
          </p>
        </div>

        <div
          className="absolute top-[11%] right-[6%] left-[6%] h-[40%] overflow-hidden rounded-lg"
          style={{
            background: 'linear-gradient(165deg, #fffdf8, var(--color-paper-dark))',
            boxShadow:
              '0 4px 8px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.2) inset, 0 0 0 1px rgba(58,44,34,0.15)',
          }}
        >
          <div
            className="flex h-[27%] items-center justify-between px-3"
            style={{ background: 'linear-gradient(90deg, var(--color-rust), var(--color-amber))' }}
          >
            <span className="font-type text-[8px] tracking-[0.3em] text-ink-dark/80 uppercase">
              the last mixtape
            </span>
            <span className="font-type text-[8px] tracking-[0.2em] text-ink-dark/80 uppercase">
              c-60
            </span>
          </div>
          <div className="flex h-[73%] items-center gap-3 px-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink-dark/70 font-hand text-2xl leading-none text-ink-dark"
              aria-label={`side ${side}`}
            >
              {side}
            </span>
            <div className="min-w-0 flex-1">
              <p className="h-6 truncate font-hand text-2xl leading-6 text-ink-dark">{title}</p>
              <div className="mt-1 space-y-2" aria-hidden="true">
                <div className="h-px bg-ink-dark/25" />
                <div className="h-px bg-ink-dark/25" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute top-[54%] right-[17%] left-[17%] h-[25%] rounded-[2rem] p-[1.5%]"
          style={{
            background: 'linear-gradient(180deg, #060504, #17110d)',
            boxShadow:
              '0 0 0 2px rgba(0,0,0,0.6), 0 2px 0 3px rgba(255,255,255,0.1), inset 0 4px 8px rgba(0,0,0,0.9)',
          }}
        >
          <div className="relative flex h-full items-center justify-between px-[3%]">
            <Reel pack={1 - progress} spinning={isPlaying} />
            <div
              className="absolute top-[62%] right-[22%] left-[22%] h-[2px]"
              style={{ background: 'var(--color-tape)', opacity: 0.85 }}
            />
            <Reel pack={progress} spinning={isPlaying} />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[2rem]"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 40%, transparent 41%)',
            }}
          />
        </div>

        <div
          className="absolute right-[14%] bottom-0 left-[14%] h-[17%]"
          style={{
            clipPath: 'polygon(7% 0, 93% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(180deg, #6a5c4f, #2e2620)',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18)',
          }}
        >
          <span className="absolute top-1/2 left-[15%] h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-black/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]" />
          <span className="absolute top-1/2 right-[15%] h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-black/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]" />
          <span className="absolute top-[26%] left-[34%] h-[48%] w-[6%] rounded-[1px] bg-black/75" />
          <span className="absolute top-[26%] right-[34%] h-[48%] w-[6%] rounded-[1px] bg-black/75" />
          <span className="absolute top-1/2 left-1/2 h-1.5 w-8 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-black/75" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(118deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 74%, rgba(255,255,255,0.08) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </div>
  )
}
