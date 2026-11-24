// Shared page background. 'night' = navy glow with a dot grid (sign-in, profile).
// 'warm' = a soft lamp glow on a dark brown wall (inside the app).
export function Backdrop({ tone = 'night' }: { tone?: 'night' | 'warm' }) {
  if (tone === 'warm') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(52rem 24rem at 50% -10%, rgba(255,190,100,0.16), transparent 65%), radial-gradient(40rem 24rem at 100% 100%, rgba(217,105,74,0.08), transparent 60%)',
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
            'radial-gradient(60rem 30rem at 20% -10%, rgba(232,162,74,0.22), transparent 60%), radial-gradient(50rem 30rem at 100% 100%, rgba(91,143,217,0.18), transparent 60%)',
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
