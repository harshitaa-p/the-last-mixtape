import type { ReactNode } from 'react'
import { Plus, X } from 'lucide-react'

export function ViewHeader({
  title,
  subtitle,
  addLabel,
  canAdd,
  open,
  onToggle,
  primary,
}: {
  title: string
  subtitle?: string
  addLabel: string
  canAdd: boolean
  open: boolean
  onToggle: () => void
  primary?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-hand text-5xl leading-none text-ink">{title}</h2>
        {subtitle && <p className="mt-1 font-body text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {canAdd && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm transition-colors ${
            open
              ? 'bg-paper font-medium text-ink-dark'
              : primary
                ? 'bg-amber font-semibold text-ink-dark hover:brightness-110'
                : 'border border-white/20 text-ink hover:bg-white/10'
          }`}
        >
          {open ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          {open ? 'close' : addLabel}
        </button>
      )}
    </div>
  )
}

export function Empty({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 px-5 py-8 text-ink-soft">
      <span className="shrink-0 text-amber">{icon}</span>
      <p className="font-body text-sm">{text}</p>
    </div>
  )
}
