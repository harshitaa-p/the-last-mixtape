import type { ReactNode } from 'react'
import { Backdrop } from './components/Backdrop'

export const inputCls =
  'w-full rounded-lg border border-white/15 bg-paper px-4 py-2.5 font-body text-sm text-ink-dark outline-none focus:border-amber'
export const btnCls =
  'rounded-full bg-amber px-6 py-2.5 font-body text-sm font-medium text-ink-dark transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100'
export const ghostBtnCls =
  'rounded-full border border-white/20 px-4 py-2 font-body text-xs text-ink transition-colors hover:bg-white/10'

// Inputs and buttons that sit on a paper card.
export const paperFieldCls =
  'w-full rounded-xl border border-ink-dark/15 bg-ink-dark/5 py-3 pr-4 pl-11 font-body text-sm text-ink-dark outline-none transition-colors placeholder:text-ink-dark/40 focus:border-amber focus:bg-white'
export const paperBtnCls =
  'flex items-center justify-center gap-2 rounded-full bg-amber py-3 font-body text-sm font-semibold text-ink-dark transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100'
export const paperGhostBtnCls =
  'rounded-full border border-ink-dark/20 px-3 py-1.5 font-body text-xs text-ink-dark transition-colors hover:bg-ink-dark/5'

export function Screen({
  children,
  wide,
  xl,
  warm,
}: {
  children: ReactNode
  wide?: boolean
  xl?: boolean
  warm?: boolean
}) {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={warm ? { background: 'var(--room-bg)' } : undefined}
    >
      <Backdrop tone={warm ? 'warm' : 'night'} />
      <div
        className={`relative mx-auto flex w-full flex-col gap-6 px-6 py-8 ${
          xl ? 'max-w-[110rem] sm:px-10 lg:px-14' : wide ? 'max-w-3xl' : 'max-w-md'
        }`}
      >
        {children}
      </div>
    </main>
  )
}

export function Heading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="text-center">
      {eyebrow && (
        <p className="font-type text-xs tracking-[0.3em] text-amber uppercase">{eyebrow}</p>
      )}
      <h1 className="mt-2 font-hand text-5xl text-ink sm:text-6xl">{title}</h1>
    </header>
  )
}

export function ErrorText({ message }: { message: string | null }) {
  return message ? <p className="font-body text-xs text-rust">{message}</p> : null
}
