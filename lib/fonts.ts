import {
  Inter,
  Roboto,
  Poppins,
  DM_Sans,
  Lato,
  Nunito,
  Open_Sans,
  Montserrat,
  Raleway,
  Source_Sans_3,
  Rajdhani,
  JetBrains_Mono,
} from 'next/font/google';

/**
 * 1RB AI terminal typography.
 *
 * Rajdhani is a squared, semi-condensed display face that reads like a
 * professional trading terminal — used for the brand mark, headings and
 * stat labels via the `--font-display` CSS variable / Tailwind `font-display`.
 * JetBrains Mono renders all numeric/tick data (`--font-mono` / `font-mono`)
 * so prices align on a fixed grid. Both are exposed as CSS variables and wired
 * onto <body> in app/layout.tsx.
 */
export const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

/**
 * Inter is the default font for all template apps.
 *
 * Font family and background color are now baked into globals.css at
 * generation time by the app builder (via CSS variable patching and a
 * Google Fonts @import). There is no longer a runtime env-var path for
 * these values — branding is applied consistently in both deployed and
 * preview modes through CSS variables.
 *
 * Preview mode applies font dynamically via postMessage in
 * hooks/use-preview-branding.ts by switching the next/font className
 * on a wrapper element (see FONT_CLASS_MAP below).
 */
export const inter = Inter({ subsets: ['latin'] });

// All supported app-builder fonts, pre-loaded at build time via next/font.
// Variable fonts don't require an explicit weight; non-variable ones do.
const roboto     = Roboto(      { subsets: ['latin'] });
const poppins    = Poppins(     { subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const dmSans     = DM_Sans(     { subsets: ['latin'] });
const lato       = Lato(        { subsets: ['latin'], weight: ['400', '700'] });
const nunito     = Nunito(      { subsets: ['latin'] });
const openSans   = Open_Sans(   { subsets: ['latin'] });
const montserrat = Montserrat(  { subsets: ['latin'] });
const raleway    = Raleway(     { subsets: ['latin'] });
const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });

/**
 * Maps app-builder font display names to their next/font className.
 * Apply the className to a wrapper element to switch the preview font —
 * font-family is inherited by all children via normal CSS inheritance.
 */
export const FONT_CLASS_MAP: Record<string, string> = {
  Inter:           inter.className,
  Roboto:          roboto.className,
  Poppins:         poppins.className,
  'DM Sans':       dmSans.className,
  Lato:            lato.className,
  Nunito:          nunito.className,
  'Open Sans':     openSans.className,
  Montserrat:      montserrat.className,
  Raleway:         raleway.className,
  'Source Sans 3': sourceSans3.className,
};
