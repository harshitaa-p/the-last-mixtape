import type { ReactNode } from 'react'

export type PrinterState = 'ready' | 'printing' | 'done'

const SCREEN_TEXT: Record<PrinterState, string> = {
  ready: 'READY',
  printing: 'PRINTING',
  done: 'DONE',
}

// A little photo printer: cream plastic body, a screen, lights, and a slot at the bottom.
// Whatever is passed as children (the strip) comes out of the slot.
export function PhotoPrinter({ state, children }: { state: PrinterState; children: ReactNode }) {
  const printing = state === 'printing'
  return (
    <div className="mx-auto w-full max-w-[21rem]">
      <span role="status" className="sr-only">
        Printer {SCREEN_TEXT[state].toLowerCase()}
      </span>

      <div
        className={`relative z-10 rounded-[1.7rem] px-5 pt-4 pb-5 ${printing ? 'printer-run' : ''}`}
        style={{
          background: 'linear-gradient(165deg, #f8f1e5 0%, #e6dbc7 55%, #cdbfa6 100%)',
          boxShadow: [
            'inset 0 2px 0 rgba(255,255,255,0.95)',
            'inset 2px 0 0 rgba(255,255,255,0.5)',
            'inset -2px 0 0 rgba(90,70,40,0.18)',
            'inset 0 -5px 9px rgba(90,70,40,0.28)',
            '0 6px 0 #a89b82',
            '0 9px 0 #8d8069',
            '0 22px 26px -6px rgba(0,0,0,0.65)',
          ].join(', '),
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-type text-[9px] tracking-[0.3em] text-ink-dark/60 uppercase">
            the last mixtape
          </p>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: printing ? '#e8a24a' : '#4fbf6f',
                boxShadow: printing ? '0 0 8px 2px #e8a24a' : '0 0 6px 1px rgba(79,191,111,0.7)',
                animation: printing ? 'rec-pulse 0.5s ease-in-out infinite' : 'none',
              }}
            />
            <span className="h-2 w-2 rounded-full bg-ink-dark/25" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-3 flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{
            background: 'linear-gradient(180deg, #14110f, #26201b)',
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          <span
            className="font-type text-sm tracking-[0.3em]"
            style={{
              color: printing ? '#e8a24a' : '#6fe08c',
              textShadow: `0 0 8px ${printing ? 'rgba(232,162,74,0.7)' : 'rgba(111,224,140,0.6)'}`,
            }}
          >
            {SCREEN_TEXT[state]}
          </span>
          <span className="font-type text-[9px] tracking-widest text-white/35">PHOTO STRIP</span>
        </div>

        <div className="mt-3 flex items-center justify-between" aria-hidden="true">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #fff, #cfc3ad 70%)',
                  boxShadow: '0 2px 0 #a89b82, 0 3px 4px rgba(0,0,0,0.3)',
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-ink-dark/30" />
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mx-auto mt-4 h-4 w-[88%] rounded-full"
          style={{
            background: 'linear-gradient(180deg, #050403, #1f1914)',
            boxShadow: [
              'inset 0 3px 5px rgba(0,0,0,0.95)',
              '0 1px 0 rgba(255,255,255,0.85)',
              printing ? '0 0 12px 1px rgba(232,162,74,0.55)' : '0 0 0 transparent',
            ].join(', '),
            transition: 'box-shadow 0.3s ease',
          }}
        />
      </div>

      <div className="relative -mt-3 mx-auto w-[74%] overflow-hidden px-1 pt-3 pb-1">{children}</div>
    </div>
  )
}
