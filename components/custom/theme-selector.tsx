'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ThemeOption {
  id: string;
  name: string;
  /** Two-stop swatch preview [surface, brand]. */
  surface: string;
  brand: string;
  brand2: string;
}

const THEMES: ThemeOption[] = [
  { id: 'carbon', name: '1RB Black Carbon', surface: '#0a0c0f', brand: '#10c996', brand2: '#14b8a6' },
  { id: 'cyber', name: 'Neon Cyber AI', surface: '#07090f', brand: '#22d3ee', brand2: '#d946ef' },
  { id: 'trader', name: 'Professional Trader Blue', surface: '#090e19', brand: '#3884f6', brand2: '#2dd4bf' },
  { id: 'gold', name: 'Luxury Gold', surface: '#100e0a', brand: '#d4af37', brand2: '#eab308' },
  { id: 'purple', name: 'Midnight Purple', surface: '#0e0b18', brand: '#956cfa', brand2: '#d946ef' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted ? theme ?? 'carbon' : 'carbon';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Select theme"
          className="text-muted-foreground hover:text-foreground"
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <p className="px-2 pb-1.5 pt-1 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Terminal theme
        </p>
        <div className="space-y-0.5">
          {THEMES.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors',
                  isActive ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-white/10"
                  style={{ background: t.surface }}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.brand2})` }}
                  />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{t.name}</span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
