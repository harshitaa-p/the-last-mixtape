import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Reel({ spinning, filled }: { spinning: boolean; filled: number }) {
  const size = 16 + filled * 14

  return (
    <div
      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{
        background: 'radial-gradient(circle at 35% 30%, #3a3a3a, #0a0a0a 75%)',
        boxShadow:
          '0 3px 6px rgba(0,0,0,0.5) inset, 0 0 0 3px #060605, 0 0 0 4px rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background:
            'repeating-radial-gradient(circle, var(--color-tape) 0px, var(--color-tape) 2px, #3d332b 2px, #3d332b 3px)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      />
      <div
        className={spinning ? 'animate-spin' : ''}
        style={{
          animationDuration: '1.6s',
          width: 11,
          height: 11,
          borderRadius: '9999px',
          background: 'radial-gradient(circle at 40% 35%, #4a4a4a, #111 70%)',
          boxShadow: '0 0 0 2px #000',
          position: 'relative',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 h-1 w-[2px] rounded-full bg-black/70"
            style={{
              transform: `rotate(${i * 72}deg) translate(-50%, -4px)`,
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function WriteProtectTab({ className }: { className: string }) {
  return (
    <div
      className={`absolute top-0 h-2 w-6 rounded-b-sm ${className}`}
      style={{ background: 'rgba(0,0,0,0.55)', boxShadow: '0 1px 2px rgba(0,0,0,0.6) inset' }}
    />
  )
}

export function Screw({ className }: { className: string }) {
  return (
    <div
      className={`absolute h-2 w-2 rounded-full ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 35%, #9a9a9a, #222 75%)',
        boxShadow: '0 1px 1px rgba(0,0,0,0.6)',
      }}
    />
  )
}

export function DeckButton({
  children,
  active,
  className = 'h-11 w-14',
  ...rest
}: {
  children: ReactNode
  active?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-md text-paper transition-transform active:translate-y-[2px] disabled:opacity-30 ${className}`}
      style={{
        background: active
          ? 'linear-gradient(180deg, var(--color-amber), #7a3a1f)'
          : 'linear-gradient(180deg, #4a4038, #221c17)',
        boxShadow: active
          ? '0 2px 0 #4a2313, 0 4px 8px rgba(0,0,0,0.4)'
          : '0 3px 0 #100d0a, 0 5px 10px rgba(0,0,0,0.4)',
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
