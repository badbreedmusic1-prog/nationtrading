import { BRAND } from '@/lib/brand';

export function Footer() {
  return (
    <footer className="w-full py-1 text-center">
      <p className="text-[11px] tracking-wide text-muted-foreground">
        <span className="font-display font-semibold text-foreground">{BRAND.name}</span>
        <span className="mx-1.5 opacity-40">·</span>
        {BRAND.tagline}
        <span className="mx-1.5 opacity-40">·</span>
        Powered by <span className="font-semibold text-foreground">Deriv</span>
      </p>
    </footer>
  );
}
