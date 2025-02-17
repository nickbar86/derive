'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

type Theme = typeof themes[number]['value'];

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (value: Theme) => {
      const effectiveTheme = value === 'system' 
        ? (mediaQuery.matches ? 'dark' : 'light')
        : value;
        
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      root.style.colorScheme = effectiveTheme;
    };

    updateTheme(savedTheme);

    const handleChange = () => {
      if (theme === 'system') updateTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  if (!mounted) {
    return (
      <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background p-2.5">
        <Monitor className="h-5 w-5" />
      </button>
    );
  }

  const CurrentIcon = themes.find(t => t.value === theme)?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background p-2.5 hover:bg-accent">
          <CurrentIcon className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              setTheme(value);
              localStorage.setItem('theme', value);
            }}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 