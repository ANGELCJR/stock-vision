import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTheme = () => {
      try {
        const stored = localStorage.getItem('theme') as Theme;
        if (stored && (stored === 'light' || stored === 'dark')) {
          setTheme(stored);
        } else if (typeof window !== 'undefined') {
          const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setTheme(systemPreference);
        }
      } catch (error) {
        setTheme('dark');
      }
      setIsInitialized(true);
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}