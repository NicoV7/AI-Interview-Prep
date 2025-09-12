'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'night';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  defaultTheme = 'light',
  storageKey = 'ai-interview-theme'
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && ['light', 'dark', 'night'].includes(stored)) {
        setTheme(stored);
      } else {
        // Check system preference for dark mode
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
        setTheme(systemTheme);
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    try {
      const root = window.document.documentElement;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark', 'night');
      
      // Add current theme class
      root.classList.add(theme);
      
      // Also set a data attribute for easier debugging
      root.setAttribute('data-theme', theme);
      
      // Store theme preference
      localStorage.setItem(storageKey, theme);
      
      console.log(`Theme switched to: ${theme}`);
    } catch (error) {
      console.warn('Failed to update theme:', error);
    }
  }, [theme, mounted, storageKey]);

  const value = {
    theme,
    mounted,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}