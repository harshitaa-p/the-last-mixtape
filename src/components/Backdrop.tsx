// Shared page background. 'night' = soft glows with a dot grid (sign-in, profile).
// 'warm' = a lamp glow on the room wall (inside the app). Colours come from the chosen theme.
export function Backdrop({ tone = 'night' }: { tone?: 'night' | 'warm' }) {
  if (tone === 'warm') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(52rem 24rem at 50% -10%, rgb(var(--glow-1) / 0.16), transparent 65%), radial-gradient(40rem 24rem at 100% 100%, rgb(var(--glow-3) / 0.09), transparent 60%)',
        }}
      />
    )
  }
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 30rem at 20% -10%, rgb(var(--glow-1) / 0.22), transparent 60%), radial-gradient(50rem 30rem at 100% 100%, rgb(var(--glow-2) / 0.18), transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
    </>
  )
}
