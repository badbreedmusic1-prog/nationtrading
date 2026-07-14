'use client';

import { ThemeProvider } from 'next-themes';

/**
 * 1RB AI ships five professional dark themes. next-themes stores the chosen
 * theme name and applies the mapped class to <html>.
 *
 * Each value must be a SINGLE class token (no spaces): next-themes passes these
 * straight to `classList.add()/remove()`, which throws a DOMException on any
 * token containing whitespace. A multi-class value like `dark theme-carbon`
 * crashes the ThemeProvider on mount and takes the whole app down with it.
 *
 * The shared `dark` class is applied permanently on <html> in app/layout.tsx
 * (all five themes are dark), so Tailwind `dark:` variants keep working while
 * the theme class here only retints the brand tokens (see app/globals.css).
 */
export const THEME_VALUES: Record<string, string> = {
  carbon: 'theme-carbon',
  cyber: 'theme-cyber',
  trader: 'theme-trader',
  gold: 'theme-gold',
  purple: 'theme-purple',
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
