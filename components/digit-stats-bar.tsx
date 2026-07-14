'use client';

import { cn } from '@/lib/utils';
import type { DigitStats } from '../lib/types';

interface DigitStatsBarProps {
  digitStats: DigitStats;
  selectedDigit: number;
  onDigitSelect: (digit: number) => void;
}

export function DigitStatsBar({
  digitStats,
  selectedDigit,
  onDigitSelect,
}: DigitStatsBarProps) {
  const { percentages, totalTicks } = digitStats;
  const maxPct = Math.max(...percentages);
  const minPct = Math.min(...percentages);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Digit heatmap
        </span>
        <span className="text-[10px] text-muted-foreground">{totalTicks} ticks</span>
      </div>
      <div className="flex min-h-0 flex-1 items-center">
        <div className="grid w-full grid-cols-5 place-items-center gap-1.5 sm:gap-3">
          {percentages.map((pct, digit) => {
            const isSelected = digit === selectedDigit;
            const isHot = totalTicks > 0 && pct === maxPct;
            const isCold = totalTicks > 0 && pct === minPct;
            const intensity = maxPct > 0 ? pct / maxPct : 0;

            return (
              <button
                key={digit}
                onClick={() => onDigitSelect(digit)}
                className={cn(
                  'group relative flex w-full flex-col items-center gap-1 rounded-xl border p-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-glow'
                    : 'border-border bg-card/40 hover:border-primary/40 hover:bg-card/70'
                )}
              >
                <span
                  className={cn(
                    'font-display text-lg font-bold sm:text-2xl',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {digit}
                </span>
                {/* Heat meter */}
                <span className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <span
                    className={cn(
                      'block h-full rounded-full transition-all',
                      isHot ? 'bg-primary' : isCold ? 'bg-destructive' : 'bg-muted-foreground/50'
                    )}
                    style={{ width: `${Math.max(intensity * 100, 4)}%` }}
                  />
                </span>
                <span
                  className={cn(
                    'tnum text-[10px]',
                    isHot && 'font-semibold text-primary',
                    isCold && 'font-semibold text-destructive',
                    !isHot && !isCold && 'text-muted-foreground'
                  )}
                >
                  {pct.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
