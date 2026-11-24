import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, getSavedThemeId } from './lib/themes'

// Apply the saved theme before anything is drawn, so there is no flash of the wrong colours.
applyTheme(getSavedThemeId())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
