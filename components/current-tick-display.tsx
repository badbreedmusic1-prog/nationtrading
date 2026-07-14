'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Tick } from '../lib/types';
import type { ActiveSymbol } from '../lib/types';

interface CurrentTickDisplayProps {
  tick: Tick | null;
  lastDigit: number | null;
  activeSymbol: ActiveSymbol | null;
  pipSize: number;
}

export function CurrentTickDisplay({
  tick,
  lastDigit,
  activeSymbol,
  pipSize,
}: CurrentTickDisplayProps) {
  // Track direction of the latest price move for a subtle up/down tint.
  const prevQuote = useRef<number | null>(null);
  const [dir, setDir] = useState<'up' | 'down' | 'flat'>('flat');
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (!tick) return;
    const prev = prevQuote.current;
    if (prev != null && tick.quote !== prev) {
      setDir(tick.quote > prev ? 'up' : 'down');
    }
    prevQuote.current = tick.quote;
    setPulseKey((k) => k + 1);
  }, [tick]);

  if (!tick || !activeSymbol) {
    return (
      <div className="py-6 text-center">
        <div className="tnum text-3xl text-muted-foreground/50">— — —</div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Awaiting feed
        </div>
      </div>
    );
  }

  const priceStr = tick.quote.toFixed(pipSize);
  const priceWithoutLast = priceStr.slice(0, -1);
  const lastDigitStr = priceStr.slice(-1);

  return (
    <div className="w-full py-2 text-center">
      <div className="mb-1.5 flex items-center justify-center gap-2">
        <span className="font-display text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {activeSymbol.underlying_symbol_name ?? activeSymbol.underlying_symbol}
        </span>
        <span
          className={cn(
            'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
            dir === 'up' && 'bg-primary/15 text-primary',
            dir === 'down' && 'bg-destructive/15 text-destructive',
            dir === 'flat' && 'bg-muted text-muted-foreground'
          )}
          aria-hidden
        >
          {dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·'}
        </span>
      </div>

      <div className="tnum text-3xl font-bold tracking-wide sm:text-4xl">
        <span className="text-foreground/80">{priceWithoutLast}</span>
        <span
          key={pulseKey}
          className="inline-block animate-ticker-in text-brand-gradient"
        >
          {lastDigitStr}
        </span>
      </div>

      <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 backdrop-blur">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Last digit</span>
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] font-mono text-xs font-bold text-[rgb(var(--primary-foreground))]">
          {lastDigit}
        </span>
      </div>
    </div>
  );
}
