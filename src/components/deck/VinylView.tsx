interface Props {
  isPlaying: boolean
  title: string | null
  side: 'A' | 'B'
  artwork: string | null
}

// Fine grooves with a few wider "gaps" between tracks, like a real pressing.
const GROOVES = `
  radial-gradient(circle, transparent 0 33%, #050505 33.2% 33.8%, transparent 34%),
  radial-gradient(circle, transparent 0 52%, #050505 52.2% 52.9%, transparent 53%),
  radial-gradient(circle, transparent 0 70%, #050505 70.2% 70.9%, transparent 71%),
  repeating-radial-gradient(circle, #0b0b0b 0px, #0b0b0b 1px, #191919 1.5px, #0e0e0e 2.5px)
`

export function VinylView({ isPlaying, title, side, artwork }: Props) {
  return (
    <div className="py-4" style={{ perspective: '900px' }}>
      <div
        className="relative mx-auto aspect-square w-[78%] max-w-[300px]"
        style={{ transform: 'rotateX(30deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-[-2%] rounded-full"
          style={{
            background: 'radial-gradient(circle, #000 55%, transparent 72%)',
            opacity: 0.55,
            filter: 'blur(10px)',
            transform: 'translateY(9%)',
          }}
        />

        <div
          className="absolute inset-[-3%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 30%, #4a4a4a, #1a1a1a 60%, #0d0d0d)',
            boxShadow:
              '0 1px 0 #555 inset, 0 3px 0 #111, 0 5px 0 #0a0a0a, 0 8px 14px rgba(0,0,0,0.6)',
          }}
        />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: '#0a0a0a',
            boxShadow: [
              '0 1px 0 #1c1c1c',
              '0 2px 0 #0a0a0a',
              '0 3px 0 #050505',
              isPlaying
                ? '0 0 26px -2px color-mix(in srgb, var(--color-amber) 55%, transparent)'
                : '0 0 0 transparent',
            ].join(', '),
            transition: 'box-shadow 0.4s ease',
          }}
        >
          <div
            className="absolute inset-[1%] rounded-full"
            style={{
              background: GROOVES,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 12px #000 inset',
              animation: isPlaying ? 'vinyl-spin 2.6s linear infinite' : 'none',
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 flex aspect-square w-[36%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-full text-center"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, var(--color-paper), var(--color-paper-dark))',
                boxShadow:
                  '0 0 0 2px #0b0b0b, 0 0 0 3px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.6)',
              }}
            >
              {artwork && (
                <img
                  src={artwork}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
              )}
              <div className="relative">
                <p className="font-type text-[7px] tracking-[0.2em] text-ink-soft uppercase">
                  side {side}
                </p>
                {!artwork && (
                  <p className="mx-auto mt-0.5 max-w-[85%] truncate font-hand text-xs leading-tight text-ink-dark">
                    {title ?? 'pick a track'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-[1%] rounded-full"
            style={{
              background:
                'conic-gradient(from 20deg, transparent 0 8%, rgba(255,255,255,0.28) 14%, transparent 22% 50%, rgba(255,255,255,0.2) 64%, transparent 72%)',
              mixBlendMode: 'screen',
            }}
          />

          <div
            className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #f2f2f2, #6a6a6a 70%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.7)',
            }}
          />
        </div>

        <div
          className="absolute h-[18%] w-[18%] rounded-full"
          style={{
            top: '-6%',
            right: '-16%',
            background: 'radial-gradient(circle at 35% 30%, #5a5a5a, #1b1b1b 70%)',
            boxShadow: '0 3px 0 #0d0d0d, 0 6px 8px rgba(0,0,0,0.6)',
          }}
        />
        <div
          className="absolute w-[4px] rounded-full transition-transform duration-700 ease-out"
          style={{
            top: '3%',
            right: '-7.5%',
            height: '58%',
            transformOrigin: 'top center',
            transform: isPlaying ? 'rotate(36deg)' : 'rotate(-14deg)',
            background: 'linear-gradient(90deg, #8a8478, #f0ece2 45%, #8a8478)',
            boxShadow: '3px 5px 4px rgba(0,0,0,0.45)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/3 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #777, #161616 75%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.7)',
            }}
          />
          <div
            className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-[2px]"
            style={{
              background: 'linear-gradient(155deg, #4a4a4a, #141414)',
              boxShadow: '2px 3px 3px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
