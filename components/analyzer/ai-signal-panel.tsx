'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceRing } from './visuals';
import type { AiSignal } from '@/lib/market-intelligence';

const STRENGTH_STYLES: Record<AiSignal['strength'], string> = {
  Strong: 'text-primary',
  Moderate: 'text-amber-400',
  Weak: 'text-muted-foreground',
};

export function AiSignalPanel({ signal, live }: { signal: AiSignal | null; live: boolean }) {
  const [time, setTime] = useState<string>('');

  // Stamp the generation time whenever the headline prediction changes.
  useEffect(() => {
    if (signal) {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }
  }, [signal?.prediction, signal?.digit]);

  return (
    <section className="glass relative overflow-hidden rounded-2xl p-5">
      {/* AI scanning sweep while analyzing live */}
      {live && <div className="scan-overlay" aria-hidden />}

      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-2))]">
            <Sparkles className="h-4 w-4 text-[rgb(var(--primary-foreground))]" />
          </span>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            AI Signal
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Cpu className="h-3 w-3" /> {live ? 'Analyzing' : 'Idle'}
        </span>
      </div>

      {!signal ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
          <div className="h-10 w-10 animate-spin-slow rounded-full border-2 border-dashed border-primary/40" />
          <p className="text-sm text-muted-foreground">Gathering ticks to generate a signal…</p>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-4">
          <ConfidenceRing value={signal.confidence} label="Confidence" />

          <div className="w-full space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Prediction</p>
                <p className="font-display text-xl font-bold text-foreground">{signal.prediction}</p>
              </div>
              {signal.digit != null && (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] font-display text-2xl font-bold text-[rgb(var(--primary-foreground))] shadow-glow">
                  {signal.digit}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-card/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Strength</p>
                <p className={cn('font-display text-base font-bold', STRENGTH_STYLES[signal.strength])}>
                  {signal.strength}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Observed rate</p>
                <p className="tnum font-display text-base font-bold text-foreground">
                  {signal.probability.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Pattern detected</p>
              <p className="text-sm font-medium text-foreground">{signal.pattern}</p>
            </div>

            <div className="rounded-lg border border-border bg-card/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Reasoning</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{signal.reasoning}</p>
            </div>

            {time && (
              <p className="text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Generated {time}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
