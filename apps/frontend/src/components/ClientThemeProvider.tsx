'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';

export function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ai-interview-theme">
      {children}
    </ThemeProvider>
  );
}