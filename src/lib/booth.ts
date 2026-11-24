export type Filter = 'color' | 'bw' | 'sepia'

export const FILTERS: { id: Filter; label: string; css: string }[] = [
  { id: 'color', label: 'colour', css: 'none' },
  { id: 'bw', label: 'black and white', css: 'grayscale(1)' },
  { id: 'sepia', label: 'sepia', css: 'sepia(0.85)' },
]

export interface Frame {
  id: string
  label: string
  bg: string // solid colour (or the base colour of a pattern)
  ink: string // caption colour
  swatch: string // CSS for the little picker button
  pattern?: 'cheetah' | 'polka'
  bare?: boolean // no border, no caption: just the photos stacked
}

export interface Sticker {
  id: string
  emoji: string
  x: number // centre, as a fraction of the strip's width and height
  y: number
  size: number // as a fraction of the strip's width
}

const SPOTS =
  'radial-gradient(circle at 28% 30%, #2a170b 0 17%, transparent 19%), radial-gradient(circle at 70% 62%, #2a170b 0 18%, transparent 20%), radial-gradient(circle at 32% 78%, #2a170b 0 11%, transparent 13%), #d9a24f'

const DOTS = 'radial-gradient(circle, #16120f 0 11%, transparent 13%) 0 0 / 7px 7px, #f4f0e8'

const NO_FRAME =
  'linear-gradient(135deg, transparent 44%, #d9694a 44% 56%, transparent 56%), #fdfaf5'

export const FRAMES: Frame[] = [
  { id: 'none', label: 'no frame', bg: '#000000', ink: '#ffffff', swatch: NO_FRAME, bare: true },
  { id: 'cream', label: 'cream', bg: '#fdfaf5', ink: '#3a2c22', swatch: '#fdfaf5' },
  { id: 'black', label: 'black', bg: '#14110f', ink: '#f3ece0', swatch: '#14110f' },
  { id: 'pink', label: 'pink', bg: '#f6d0dd', ink: '#5a2a3a', swatch: '#f6d0dd' },
  { id: 'amber', label: 'amber', bg: '#e8a24a', ink: '#3a2c22', swatch: '#e8a24a' },
  { id: 'cheetah', label: 'cheetah', bg: '#d9a24f', ink: '#3a2c22', swatch: SPOTS, pattern: 'cheetah' },
  { id: 'polka', label: 'polka dots', bg: '#f4f0e8', ink: '#1a1612', swatch: DOTS, pattern: 'polka' },
]

// Small seeded random numbers, so one strip's spots are all drawn from the same sequence.
function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// One spot: a broken dark ring around a darker centre, with a few specks beside it.
function rosette(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rand: () => number) {
  const rot = rand() * Math.PI * 2
  ctx.fillStyle = '#b9772f'
  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 0.62, r * 0.5, rot, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#2a170b'
  ctx.lineCap = 'round'
  const arcs = 3 + Math.floor(rand() * 3)
  const step = (Math.PI * 2) / arcs
  for (let i = 0; i < arcs; i++) {
    ctx.lineWidth = r * (0.44 + rand() * 0.24)
    ctx.beginPath()
    ctx.ellipse(cx, cy, r, r * 0.8, rot, rot + i * step, rot + i * step + step * (0.5 + rand() * 0.32))
    ctx.stroke()
  }

  ctx.fillStyle = '#1d0f06'
  for (let i = 0; i < 2; i++) {
    const a = rand() * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r * 1.7, cy + Math.sin(a) * r * 1.5, 2 + rand() * 2.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function paintCheetah(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rand = seeded(Date.now() % 1_000_000)
  const base = ctx.createLinearGradient(0, 0, w, h)
  base.addColorStop(0, '#e3ad5a')
  base.addColorStop(1, '#c98f3e')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  const cell = 78
  for (let row = -1; row * cell * 0.86 < h + cell; row++) {
    for (let col = -1; col * cell < w + cell; col++) {
      const x = col * cell + (row % 2 ? cell / 2 : 0) + (rand() - 0.5) * cell * 0.4
      const y = row * cell * 0.86 + (rand() - 0.5) * cell * 0.3
      rosette(ctx, x, y, 17 + rand() * 9, rand)
    }
  }
}

const PHOTO_W = 960
const PHOTO_H = 720 // 4:3

// Takes one picture from the live video: centred 4:3 crop, flipped like a mirror so it matches
// what you saw on screen. It stays in plain colour; the look is applied later, when the strip
// is printed, so the look and frame can be changed after the shoot.
export function captureFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = PHOTO_W
  canvas.height = PHOTO_H
  const ctx = canvas.getContext('2d')!
  const vw = video.videoWidth
  const vh = video.videoHeight
  const sw = Math.min(vw, (vh * 4) / 3)
  const sh = (sw * 3) / 4
  ctx.save()
  ctx.translate(PHOTO_W, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, PHOTO_W, PHOTO_H)
  ctx.restore()
  return canvas
}

// A filtered copy of a picture. Done pixel by pixel because Safari ignores ctx.filter.
export function applyFilter(source: HTMLCanvasElement, filter: Filter): HTMLCanvasElement {
  if (filter === 'color') return source
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0)
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    if (filter === 'bw') {
      const y = 0.299 * r + 0.587 * g + 0.114 * b
      d[i] = d[i + 1] = d[i + 2] = y
    } else {
      d[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b)
      d[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b)
      d[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b)
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

interface PolkaLayout {
  pad: number // border width
  gap: number // space between photos
  ph: number // photo height
  count: number // number of photos
  clear: { x: number; y: number; w: number; h: number } // the caption, kept free of dots
}

// Soft off-white with small black dots set along the border and between the photos, evenly
// spaced with a touch of natural wobble in position and size. Aesthetic, not a loud pattern.
function paintPolka(ctx: CanvasRenderingContext2D, w: number, h: number, layout: PolkaLayout) {
  const { pad, gap, ph, count, clear } = layout
  ctx.fillStyle = '#f4f0e8'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#16120f'
  const rand = seeded(Date.now() % 1_000_000)
  const step = 52
  const wobble = () => (rand() - 0.5) * 3
  const radius = () => 5.5 + rand() * 2
  const dot = (x: number, y: number, r: number) => {
    if (x > clear.x - 6 && x < clear.x + clear.w + 6 && y > clear.y - 6 && y < clear.y + clear.h + 6)
      return
    ctx.beginPath()
    ctx.arc(x + wobble(), y + wobble(), r, 0, Math.PI * 2)
    ctx.fill()
  }

  // the two side borders, the right one offset by half a step so the dots zig-zag
  for (let y = step / 2; y < h; y += step) {
    dot(pad / 2, y, radius())
    dot(w - pad / 2, y + step / 2, radius())
  }
  // the top border and the bottom edge
  for (let x = step; x < w - step / 2; x += step) {
    dot(x, pad / 2, radius())
    dot(x, h - pad / 2, radius())
  }
  // the thin gaps between photos get smaller dots
  for (let i = 1; i < count; i++) {
    const y = pad + i * ph + (i - 1) * gap + gap / 2
    for (let x = step; x < w - step / 2; x += step * 0.75) dot(x, y, 3.6 + rand() * 0.8)
  }
}

// Stacks the pictures into one tall strip with a frame and a caption, like the printout of a
// real booth, then puts any stickers on top. The "no frame" choice is just the photos.
export async function composeStrip(
  pictures: HTMLCanvasElement[],
  frame: Frame,
  caption: string,
  filter: Filter = 'color',
  stickers: Sticker[] = [],
): Promise<Blob> {
  const frames = pictures.map((p) => applyFilter(p, filter))
  const heavy = frame.pattern === 'cheetah' // thick border, a mat round each photo, a caption label
  const polka = frame.pattern === 'polka' // slim border, dots on soft off-white
  const bare = frame.bare === true
  const W = 600
  const pad = bare ? 0 : heavy ? 58 : polka ? 44 : 36
  const gap = bare ? 0 : heavy ? 26 : polka ? 18 : 20
  const footer = bare ? 0 : polka ? 118 : 140
  const pw = W - pad * 2
  const ph = Math.round((pw * 3) / 4)
  const H = pad + frames.length * ph + (frames.length - 1) * gap + footer

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  if (frame.pattern === 'cheetah') {
    paintCheetah(ctx, W, H)
  } else if (polka) {
    paintPolka(ctx, W, H, {
      pad,
      gap,
      ph,
      count: frames.length,
      clear: { x: pad, y: H - footer + 8, w: pw, h: footer - 16 },
    })
  } else {
    ctx.fillStyle = frame.bg
    ctx.fillRect(0, 0, W, H)
  }

  frames.forEach((f, i) => {
    const y = pad + i * (ph + gap)
    if (heavy) {
      // a thin cream mat around each photo, like the white window in a patterned instant frame
      ctx.fillStyle = '#fdfaf5'
      ctx.fillRect(pad - 7, y - 7, pw + 14, ph + 14)
    }
    ctx.drawImage(f, pad, y, pw, ph)
    if (!bare) {
      ctx.strokeStyle = 'rgba(0,0,0,0.28)'
      ctx.lineWidth = 2
      ctx.strokeRect(pad, y, pw, ph)
    }
  })

  if (!bare) {
    if (document.fonts?.load) {
      await document.fonts.load("54px 'Caveat'")
      await document.fonts.load("20px 'Courier Prime'")
    }
    if (heavy) {
      // a cream label keeps the caption readable on top of the pattern
      ctx.fillStyle = '#fdfaf5'
      ctx.beginPath()
      ctx.roundRect(pad, H - footer + 14, pw, 96, 14)
      ctx.fill()
    }
    ctx.fillStyle = heavy ? '#3a2c22' : frame.ink
    ctx.textAlign = 'center'
    ctx.font = "54px 'Caveat', cursive"
    ctx.fillText(caption, W / 2, H - footer + 62, pw)
    ctx.font = "20px 'Courier Prime', monospace"
    const date = new Date()
      .toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      .toUpperCase()
    ctx.fillText(date, W / 2, H - footer + 100, pw)
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const s of stickers) {
    const px = s.size * W
    ctx.font = `${px}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif`
    ctx.fillText(s.emoji, s.x * W, s.y * H)
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
  if (!blob) throw new Error("Couldn't print the strip. Try again.")
  return blob
}
