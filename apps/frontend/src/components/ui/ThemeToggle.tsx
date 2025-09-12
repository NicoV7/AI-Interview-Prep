'use client';

import React, { useState } from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'night', label: 'Night', icon: '🌚' },
];

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md opacity-50">
        <span className="text-sm">⚪</span>
        <span className="text-sm font-medium">Theme</span>
      </div>
    );
  }

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-sm hover:shadow-md"
        aria-label="Toggle theme"
      >
        <span className="text-sm">{currentTheme.icon}</span>
        <span className="text-sm font-medium text-card-foreground">{currentTheme.label}</span>
        <svg
          className={`w-4 h-4 transition-transform text-muted-foreground ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 py-1 w-36 bg-popover/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-20">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  theme === themeOption.value 
                    ? 'bg-accent text-accent-foreground font-medium' 
                    : 'text-popover-foreground'
                }`}
              >
                <span>{themeOption.icon}</span>
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <svg
                    className="w-4 h-4 ml-auto text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}