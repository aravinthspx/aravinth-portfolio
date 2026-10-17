import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'

type MotionPref = { reduced: boolean; systemReduced: boolean; userOff: boolean; toggle: () => void }

const Ctx = createContext<MotionPref>({ reduced: false, systemReduced: false, userOff: false, toggle: () => {} })

const KEY = 'aravinth-motion-off'

function readStored() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [userOff, setUserOff] = useState(readStored)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setSystemReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const reduced = systemReduced || userOff

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])

  const toggle = () =>
    setUserOff((v) => {
      try {
        localStorage.setItem(KEY, v ? '0' : '1')
      } catch {
        /* storage unavailable */
      }
      return !v
    })

  return (
    <Ctx.Provider value={{ reduced, systemReduced, userOff, toggle }}>
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
    </Ctx.Provider>
  )
}

export const useMotionPref = () => useContext(Ctx)

export const spring = { type: 'spring', stiffness: 420, damping: 22 } as const
