import { useSyncExternalStore } from 'react'

// Themes are sets of CSS variables written onto <html>, plus a few emojis. Everything coloured by
// the variables (backgrounds, glows, the shelf, the accent, cards) changes at once, and the
// emojis (the floating ones on the shelf screen, and the photo booth stickers) change too.
// The choice is remembered on this device.
export interface Theme {
  id: string
  label: string
  vibe: string
  vars: Record<string, string>
  decor: [string, string, string, string] // floating emojis on the shelf screen
  stickers: string[] // the photo booth sticker pack (12)
}

// Glows are "R G B" numbers so the app can set their see-through amount itself.
function colours(c: {
  wall: string
  room: string
  accent: string
  rust: string
  ink: string
  soft: string
  paper: string
  paperDark: string
  glow1: string
  glow2: string
  glow3: string
  plankTop: string
  plankBottom: string
}): Record<string, string> {
  return {
    '--color-wall': c.wall,
    '--room-bg': c.room,
    '--color-amber': c.accent,
    '--color-rust': c.rust,
    '--color-ink': c.ink,
    '--color-ink-soft': c.soft,
    '--color-paper': c.paper,
    '--color-paper-dark': c.paperDark,
    '--glow-1': c.glow1,
    '--glow-2': c.glow2,
    '--glow-3': c.glow3,
    '--plank-top': c.plankTop,
    '--plank-bottom': c.plankBottom,
  }
}

export const THEMES: Theme[] = [
  {
    id: 'cosy',
    label: 'cosy',
    vibe: 'warm brown and amber',
    vars: colours({
      wall: '#1f2a3a', room: '#2a1f1a', accent: '#e8a24a', rust: '#d9694a', ink: '#f3ece0',
      soft: '#9aa7b8', paper: '#fdfaf5', paperDark: '#ece2cf', glow1: '240 175 85',
      glow2: '91 143 217', glow3: '217 105 74', plankTop: '#9a7351', plankBottom: '#5d412d',
    }),
    decor: ['⭐', '❤️', '🎵', '✨'],
    stickers: ['❤️', '✨', '⭐', '🌸', '🎀', '😎', '🥰', '🔥', '🎶', '🐆', '💋', '🍒'],
  },
  {
    id: 'midnight',
    label: 'midnight',
    vibe: 'deep indigo and lilac',
    vars: colours({
      wall: '#12142b', room: '#171a35', accent: '#b7a3ff', rust: '#ff7aa8', ink: '#ece9ff',
      soft: '#9aa0c8', paper: '#fbf9ff', paperDark: '#e6e1f5', glow1: '150 130 255',
      glow2: '80 140 255', glow3: '200 120 255', plankTop: '#6a6a99', plankBottom: '#3a3a63',
    }),
    decor: ['🌙', '✨', '🌠', '⭐'],
    stickers: ['🌙', '⭐', '✨', '🌌', '🔮', '🦉', '🪐', '💫', '🌠', '🕯️', '🖤', '☁️'],
  },
  {
    id: 'rose',
    label: 'rose',
    vibe: 'dusty pink and plum',
    vars: colours({
      wall: '#2a1520', room: '#301a25', accent: '#ff9bb8', rust: '#ff6f91', ink: '#fbe9ee',
      soft: '#c9a1ae', paper: '#fff6f8', paperDark: '#f3dfe4', glow1: '255 140 170',
      glow2: '200 90 160', glow3: '255 110 140', plankTop: '#a96b78', plankBottom: '#6e3d4a',
    }),
    decor: ['🌹', '💗', '🎀', '🌸'],
    stickers: ['🌹', '🎀', '💗', '🌷', '💌', '🩷', '🦢', '💋', '🍓', '🪞', '🧁', '🌸'],
  },
  {
    id: 'sage',
    label: 'sage',
    vibe: 'forest green and cream',
    vars: colours({
      wall: '#16231d', room: '#1b2a22', accent: '#a8d5a2', rust: '#e6a56a', ink: '#eaf3e6',
      soft: '#9fb8a6', paper: '#f9fbf3', paperDark: '#e5ebd6', glow1: '150 210 150',
      glow2: '90 160 120', glow3: '200 190 110', plankTop: '#8a7a55', plankBottom: '#574b30',
    }),
    decor: ['🌿', '🍃', '🦋', '🍀'],
    stickers: ['🌿', '🍃', '🪴', '🌱', '🐸', '🍄', '🦋', '🌼', '🍀', '🐛', '☘️', '🧺'],
  },
  {
    id: 'ocean',
    label: 'ocean',
    vibe: 'deep sea and aqua',
    vars: colours({
      wall: '#0e2230', room: '#12293a', accent: '#6fd3e0', rust: '#ff8c7a', ink: '#e6f6fa',
      soft: '#93b7c4', paper: '#f6fcfd', paperDark: '#dcecef', glow1: '100 210 230',
      glow2: '60 130 200', glow3: '90 190 200', plankTop: '#6a8a93', plankBottom: '#3a5760',
    }),
    decor: ['🌊', '🐚', '🐬', '🫧'],
    stickers: ['🌊', '🐚', '🐬', '🐙', '🦀', '🐠', '⚓', '🏝️', '🫧', '🐳', '🪸', '⛵'],
  },
  {
    id: 'sunset',
    label: 'sunset',
    vibe: 'purple dusk and coral',
    vars: colours({
      wall: '#251b33', room: '#2b1d30', accent: '#ff9a62', rust: '#ff6b8b', ink: '#fdeee4',
      soft: '#cfa9b8', paper: '#fff8f3', paperDark: '#f2e1d6', glow1: '255 150 100',
      glow2: '200 80 160', glow3: '255 107 139', plankTop: '#a56d5e', plankBottom: '#6e4439',
    }),
    decor: ['🌅', '🌴', '🧡', '☀️'],
    stickers: ['🌅', '🌴', '🍹', '🕶️', '🌺', '🦩', '🧡', '☀️', '🏖️', '🍉', '🎸', '🪩'],
  },
  {
    id: 'mocha',
    label: 'mocha',
    vibe: 'coffee and oat milk',
    vars: colours({
      wall: '#1c1815', room: '#221d19', accent: '#d6b98c', rust: '#c98b6a', ink: '#f1e8dc',
      soft: '#a89a8a', paper: '#fbf6ee', paperDark: '#e9dfcf', glow1: '214 185 140',
      glow2: '160 120 90', glow3: '190 150 110', plankTop: '#8b6b4e', plankBottom: '#58402d',
    }),
    decor: ['☕', '🍪', '📖', '🤎'],
    stickers: ['☕', '🥐', '🍪', '🧁', '🍩', '🥛', '🍫', '🫖', '📖', '🕰️', '🤎', '🧸'],
  },
  {
    id: 'cherry',
    label: 'cherry',
    vibe: 'cherry cola and black',
    vars: colours({
      wall: '#1a0f12', room: '#211217', accent: '#ff6e80', rust: '#ff8a5b', ink: '#fde8ea',
      soft: '#c79aa1', paper: '#fff7f7', paperDark: '#f1dcdc', glow1: '255 90 110',
      glow2: '150 40 70', glow3: '255 120 90', plankTop: '#8f4b4b', plankBottom: '#552a2a',
    }),
    decor: ['🍒', '💋', '🔥', '🖤'],
    stickers: ['🍒', '💋', '🥤', '❤️', '🕶️', '🚗', '🎸', '🖤', '🔥', '🎧', '🍿', '💃'],
  },
  {
    id: 'lavender',
    label: 'lavender',
    vibe: 'orchid purple and butterflies',
    vars: colours({
      wall: '#20152e', room: '#271a3a', accent: '#d9b3ff', rust: '#ff8fd0', ink: '#f5ecff',
      soft: '#b9a5d1', paper: '#fdf9ff', paperDark: '#eadcf5', glow1: '200 150 255',
      glow2: '255 140 210', glow3: '170 110 255', plankTop: '#8e6fb0', plankBottom: '#553f78',
    }),
    decor: ['🦋', '💜', '✨', '🔮'],
    stickers: ['🦋', '💜', '🔮', '🍇', '🫐', '🦄', '🌸', '✨', '🎀', '🪄', '🌷', '💫'],
  },
  {
    id: 'matcha',
    label: 'matcha',
    vibe: 'green tea and mochi',
    vars: colours({
      wall: '#17221a', room: '#1c2a1f', accent: '#c5e17a', rust: '#f2a65a', ink: '#f0f6e4',
      soft: '#a5b896', paper: '#fafcf2', paperDark: '#e8edd3', glow1: '190 225 120',
      glow2: '110 180 110', glow3: '230 200 110', plankTop: '#8a8052', plankBottom: '#575030',
    }),
    decor: ['🍵', '🌱', '🍡', '🍃'],
    stickers: ['🍵', '🌱', '🍡', '🐼', '🎋', '🍃', '🥝', '🧋', '🍙', '🌿', '🪴', '🥬'],
  },
  {
    id: 'peach',
    label: 'peach',
    vibe: 'soft peach and honey',
    vars: colours({
      wall: '#2c1a16', room: '#34201a', accent: '#ffb48a', rust: '#ff8a7a', ink: '#ffefe6',
      soft: '#d2a898', paper: '#fff8f3', paperDark: '#f3e0d4', glow1: '255 180 140',
      glow2: '255 140 120', glow3: '255 200 120', plankTop: '#b07a62', plankBottom: '#6f4636',
    }),
    decor: ['🍑', '🌼', '🍯', '🧡'],
    stickers: ['🍑', '🌼', '🧡', '🌻', '🐝', '🍯', '🥭', '🍊', '🌞', '🧁', '🍦', '🎈'],
  },
  {
    id: 'galaxy',
    label: 'galaxy',
    vibe: 'deep space and stardust',
    vars: colours({
      wall: '#0b0d1f', room: '#0f1228', accent: '#ffd166', rust: '#ff6fb5', ink: '#eef0ff',
      soft: '#9aa0c8', paper: '#fbfbff', paperDark: '#e3e5f5', glow1: '255 209 102',
      glow2: '110 90 255', glow3: '255 111 181', plankTop: '#4a4f7a', plankBottom: '#272b4d',
    }),
    decor: ['🪐', '🚀', '⭐', '🛸'],
    stickers: ['🪐', '🌙', '🚀', '👽', '☄️', '🌌', '⭐', '🛸', '🔭', '💫', '🌠', '🌟'],
  },
  {
    id: 'autumn',
    label: 'autumn',
    vibe: 'falling leaves and pumpkin spice',
    vars: colours({
      wall: '#261a12', room: '#2d1e14', accent: '#f08a3c', rust: '#d8604a', ink: '#f8ebdd',
      soft: '#c9ab8f', paper: '#fff9f0', paperDark: '#efe0c8', glow1: '240 138 60',
      glow2: '200 85 60', glow3: '220 170 80', plankTop: '#9a6b43', plankBottom: '#5e3e24',
    }),
    decor: ['🍂', '🍁', '🦊', '🎃'],
    stickers: ['🍂', '🍁', '🎃', '🌰', '🧣', '🍄', '🦊', '🥧', '🍎', '🕯️', '🧡', '🍵'],
  },
  {
    id: 'frost',
    label: 'frost',
    vibe: 'winter ice and snow',
    vars: colours({
      wall: '#0f1b26', room: '#132230', accent: '#bfe3ff', rust: '#8fb4ff', ink: '#eaf5ff',
      soft: '#9db6c9', paper: '#f7fbff', paperDark: '#dde9f3', glow1: '170 215 255',
      glow2: '120 160 230', glow3: '200 230 255', plankTop: '#6f8aa0', plankBottom: '#3e5568',
    }),
    decor: ['❄️', '⛄', '💙', '✨'],
    stickers: ['❄️', '⛄', '🧊', '🧤', '🦌', '⛸️', '🎿', '🌨️', '🧣', '💙', '🫧', '✨'],
  },
  {
    id: 'neon',
    label: 'neon',
    vibe: 'arcade lights and synthwave',
    vars: colours({
      wall: '#0a0a14', room: '#0f0f1c', accent: '#ff4fd8', rust: '#00e5ff', ink: '#f5f0ff',
      soft: '#a79fc9', paper: '#fbf9ff', paperDark: '#e4def5', glow1: '255 79 216',
      glow2: '0 229 255', glow3: '140 90 255', plankTop: '#52408a', plankBottom: '#2b2150',
    }),
    decor: ['👾', '⚡', '🕹️', '🌈'],
    stickers: ['👾', '🕹️', '⚡', '💿', '📼', '🎮', '🌈', '🔊', '💾', '🤖', '✨', '🎧'],
  },
  {
    id: 'leopard',
    label: 'leopard',
    vibe: 'gold, black and a little wild',
    vars: colours({
      wall: '#17110c', room: '#1d150e', accent: '#e0b050', rust: '#c06a22', ink: '#f5ecd9',
      soft: '#b09a78', paper: '#fbf4e6', paperDark: '#ead9b8', glow1: '224 176 80',
      glow2: '150 90 30', glow3: '200 140 60', plankTop: '#7a5a2e', plankBottom: '#47321a',
    }),
    decor: ['🐆', '🖤', '👑', '✨'],
    stickers: ['🐆', '🖤', '✨', '💋', '👑', '💎', '🕶️', '🔥', '🦁', '🧡', '💃', '🥂'],
  },
]

const KEY = 'tlm-theme'

export function getSavedThemeId(): string {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && THEMES.some((t) => t.id === saved)) return saved
  } catch {
    // private windows can block storage; the default theme is fine then
  }
  return THEMES[0].id
}

// The theme in use. Screens read it through useTheme() so they redraw when it changes.
let currentId = getSavedThemeId()
const listeners = new Set<() => void>()

export function getTheme(): Theme {
  return THEMES.find((t) => t.id === currentId) ?? THEMES[0]
}

export function applyTheme(id: string) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0]
  currentId = theme.id
  const root = document.documentElement
  for (const [name, value] of Object.entries(theme.vars)) root.style.setProperty(name, value)
  root.dataset.theme = theme.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.vars['--color-wall'])
  try {
    localStorage.setItem(KEY, theme.id)
  } catch {
    // not saved, but the theme still applies for this visit
  }
  listeners.forEach((listener) => listener())
}

export function useTheme(): Theme {
  const id = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => currentId,
  )
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
