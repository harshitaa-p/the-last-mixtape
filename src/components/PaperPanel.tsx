import type { ReactNode } from 'react'
import { X } from 'lucide-react'

// Paper card with a strip of tape, used for the "add something" panels.
export function PaperPanel({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <section className="relative rounded-2xl bg-paper p-5 text-ink-dark shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
      <div
        aria-hidden="true"
        className="absolute -top-3 left-8 h-6 w-20 -rotate-3 rounded-sm bg-amber/70"
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-hand text-3xl">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="close"
          className="rounded-full p-1.5 text-ink-dark/50 hover:bg-ink-dark/10 hover:text-ink-dark"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}
