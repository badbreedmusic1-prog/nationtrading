'use client';

import { ThemeProvider } from 'next-themes';

/**
 * 1RB AI ships five professional dark themes. next-themes stores the chosen
 * theme name and applies the mapped class list to <html> — each maps to
 * `dark <theme-class>` so Tailwind `dark:` variants keep working while the
 * theme class retints the brand tokens (see app/globals.css).
 */
export const THEME_VALUES: Record<string, string> = {
  carbon: 'dark theme-carbon',
  cyber: 'dark theme-cyber',
  trader: 'dark theme-trader',
  gold: 'dark theme-gold',
  purple: 'dark theme-purple',
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="carbon"
      themes={Object.keys(THEME_VALUES)}
      value={THEME_VALUES}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
