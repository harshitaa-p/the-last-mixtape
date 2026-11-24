import type { ButtonHTMLAttributes, ReactNode } from 'react'

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
