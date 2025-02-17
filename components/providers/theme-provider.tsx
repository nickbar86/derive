'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = document.documentElement
    const stored = localStorage.getItem('theme') as Theme

    if (stored) {
      setTheme(stored)
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateTheme = (value: Theme) => {
      const isDark = 
        value === 'dark' || 
        (value === 'system' && mediaQuery.matches)

      root.classList.remove('light', 'dark')
      root.classList.add(isDark ? 'dark' : 'light')
      root.style.colorScheme = isDark ? 'dark' : 'light'
    }

    updateTheme(stored || theme)

    const handleChange = () => updateTheme(theme)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (theme) => {
          localStorage.setItem('theme', theme)
          setTheme(theme)
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error('you need to wrap it in a ThemeProvider')
  return context
}
