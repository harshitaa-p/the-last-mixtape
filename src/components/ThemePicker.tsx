import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { applyTheme, THEMES, useTheme } from '../lib/themes'

// A palette button in the corner of every screen. Tap a theme and the whole app changes at once.
export function ThemePicker() {
  const [open, setOpen] = useState(false)
  const current = useTheme().id
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={boxRef} className="fixed bottom-4 left-4 z-50">
      {open && (
        <div
          role="dialog"
          aria-label="choose a theme"
          className="absolute bottom-14 left-0 max-h-[70vh] w-[19rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl bg-paper p-4 text-ink-dark shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        >
          <p className="mb-3 font-hand text-3xl leading-none">pick a theme</p>
          <ul className="grid grid-cols-2 gap-2.5">
            {THEMES.map((theme) => {
              const selected = current === theme.id
              return (
                <li key={theme.id}>
                  <button
                    type="button"
                    onClick={() => applyTheme(theme.id)}
                    aria-pressed={selected}
                    className={`flex w-full flex-col gap-2 rounded-xl p-2 text-left transition-colors hover:bg-ink-dark/5 ${
                      selected ? 'bg-ink-dark/5 ring-2 ring-ink-dark/60' : 'ring-1 ring-ink-dark/10'
                    }`}
                  >
                    <span
                      className="relative flex h-12 items-end gap-1.5 overflow-hidden rounded-lg p-1.5"
                      style={{
                        background: `linear-gradient(135deg, ${theme.vars['--color-wall']} 0 50%, ${theme.vars['--room-bg']} 50% 100%)`,
                      }}
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ background: theme.vars['--color-amber'] }}
                      />
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ background: theme.vars['--color-rust'] }}
                      />
                      <span
                        className="ml-auto h-2.5 w-6 rounded-sm"
                        style={{ background: theme.vars['--plank-top'] }}
                      />
                      {selected && (
                        <Check
                          size={14}
                          aria-hidden="true"
                          className="absolute top-1.5 right-1.5 text-white drop-shadow"
                        />
                      )}
                    </span>
                    <span>
                      <span className="block font-body text-sm font-medium">{theme.label}</span>
                      <span aria-hidden="true" className="block text-sm leading-tight">
                        {theme.decor.join(' ')}
                      </span>
                      <span className="block font-body text-[11px] leading-tight text-ink-dark/60">
                        {theme.vibe}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="change theme"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-ink shadow-lg backdrop-blur transition-transform hover:scale-105 active:scale-95"
      >
        <Palette size={20} aria-hidden="true" />
      </button>
    </div>
  )
}
