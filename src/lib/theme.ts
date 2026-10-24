import { useCallback, useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'
const KEY = 'aravinth-theme'
const ORDER: Theme[] = ['system', 'light', 'dark']

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

/** Applies a theme to <html>: no attribute = follow the system setting. Also updates the browser chrome colour. */
export function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', t)
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0a0a' : '#ffffff')
}

/** Current theme choice plus setters. Kept in sync across components and browser tabs. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read)

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* storage unavailable: still apply for this visit */
    }
    applyTheme(t)
    setThemeState(t)
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }))
  }, [])

  const cycle = useCallback(() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]), [theme, setTheme])

  useEffect(() => {
    const sync = () => setThemeState(read())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystem = () => read() === 'system' && applyTheme('system')
    window.addEventListener('themechange', sync)
    window.addEventListener('storage', sync)
    mq.addEventListener('change', onSystem)
    return () => {
      window.removeEventListener('themechange', sync)
      window.removeEventListener('storage', sync)
      mq.removeEventListener('change', onSystem)
    }
  }, [])

  return { theme, setTheme, cycle }
}

export const themeLabel: Record<Theme, string> = { system: 'System', light: 'Light', dark: 'Dark' }
