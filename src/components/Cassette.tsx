// Cassette illustration. Reels spin slowly (see .reel in index.css).
type Spin = boolean | 'hover'

function Reel({ cx, cy, spin }: { cx: number; cy: number; spin: Spin }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={17} fill="#0f1521" stroke="#46566f" strokeWidth={2} />
      <g
        className={spin === 'hover' ? 'reel-hover' : spin ? 'reel' : undefined}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <circle cx={cx} cy={cy} r={9} fill="#fdfaf5" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x={cx - 1.5}
            y={cy - 9}
            width={3}
            height={5}
            fill="#0f1521"
            transform={`rotate(${deg} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={3} fill="#0f1521" />
      </g>
    </g>
  )
}

interface CassetteProps {
  className?: string
  title?: string // handwritten text on the label
  stripe?: string // small typewriter text on the top stripe
  body?: string // shell colour
  accent?: string // stripe colour
  spin?: Spin // true = always, 'hover' = while a parent with class "group" is hovered
}

export function Cassette({
  className,
  title = 'for you, far away',
  stripe = 'THE LAST MIXTAPE',
  body = '#2d3a50',
  accent = '#e8a24a',
  spin = true,
}: CassetteProps) {
  const shown = title.length > 24 ? `${title.slice(0, 23)}…` : title
  const size = shown.length > 16 ? 22 : shown.length > 11 ? 26 : 30
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={`Cassette: ${title}`}>
      <rect x={10} y={10} width={300} height={180} rx={18} fill={body} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      <rect x={14} y={14} width={292} height={172} rx={15} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
      {[
        [27, 27],
        [293, 27],
        [27, 173],
        [293, 173],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="rgba(0,0,0,0.45)" />
      ))}
      <rect x={38} y={30} width={244} height={86} rx={8} fill="#fdfaf5" />
      <rect x={38} y={36} width={244} height={16} fill={accent} />
      <text x={160} y={48} textAnchor="middle" fontFamily="'Courier Prime', monospace" fontSize={11} letterSpacing={3} fill="#3a2c22">
        {stripe}
      </text>
      <text x={160} y={86} textAnchor="middle" fontFamily="'Caveat', cursive" fontSize={size} fill="#3a2c22">
        {shown}
      </text>
      <line x1={64} y1={100} x2={256} y2={100} stroke="#3a2c22" strokeOpacity={0.25} />
      <rect x={92} y={124} width={136} height={46} rx={23} fill="#161d2a" stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
      <Reel cx={121} cy={147} spin={spin} />
      <Reel cx={199} cy={147} spin={spin} />
      <path d="M70 190 L92 170 H228 L250 190 Z" fill="rgba(0,0,0,0.28)" />
    </svg>
  )
}
