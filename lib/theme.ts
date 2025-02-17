type Theme = 'light' | 'dark' | 'system';

export const themeUtils = {
  get: () => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage?.getItem('theme') as Theme) || 'system';
  },
  
  set: (theme: Theme) => {
    if (typeof window === 'undefined') return;
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  },

  subscribe: (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }
}; 