'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import { CurrentTickDisplay } from './current-tick-display';
import { analysePredictions } from '../lib/prediction-analysis';
import type { Signal } from '../lib/prediction-analysis';
import type { ActiveSymbol, Tick } from '@deriv/core';

const SAMPLE_SIZES = [25, 50, 100, 250, 500, 1000];

export interface PredictionAnalyserProps {
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  selectSymbol: (symbol: string) => void;
  currentTick: Tick | null;
  lastDigit: number | null;
  prices: number[];
  pipSize: number;
  sampleSize: number;
  setSampleSize: (n: number) => void;
  barrier: number;
  setBarrier: (n: number) => void;
}

function confidenceLabel(confidence: number): { label: string; className: string } {
  if (confidence >= 60) return { label: 'Strong', className: 'text-green-500' };
  if (confidence >= 30) return { label: 'Moderate', className: 'text-amber-500' };
  return { label: 'Weak', className: 'text-muted-foreground' };
}

function SignalCard({ signal, top }: { signal: Signal; top: boolean }) {
  const conf = confidenceLabel(signal.confidence);
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border p-3 sm:p-4 transition-colors',
        top ? 'border-primary/60 bg-primary/5' : 'border-border bg-muted/30'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{signal.label}</span>
        {top && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            Top pick
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {signal.probability.toFixed(1)}%
          </div>
          <div className="text-[11px] text-muted-foreground">observed rate</div>
        </div>
        <div className="text-right">
          <div className={cn('text-sm font-semibold', conf.className)}>{conf.label}</div>
          <div className="text-[11px] text-muted-foreground">{signal.confidence}% conf.</div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', top ? 'bg-primary' : 'bg-muted-foreground/50')}
          style={{ width: `${Math.min(100, signal.confidence)}%` }}
        />
      </div>
    </div>
  );
}

export function PredictionAnalyser({
  symbols,
  activeSymbol,
  selectSymbol,
  currentTick,
  lastDigit,
  prices,
  pipSize,
  sampleSize,
  setSampleSize,
  barrier,
  setBarrier,
}: PredictionAnalyserProps) {
  const analysis = useMemo(
    () => analysePredictions(prices, pipSize, sampleSize, barrier),
    [prices, pipSize, sampleSize, barrier]
  );

  const maxPct = Math.max(...analysis.frequencies.map((f) => f.percentage), 0);
  const recentDigits = analysis.digits.slice(-20);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Controls */}
      <Card className="border shadow-sm">
        <CardContent className="grid gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Market</label>
            <SymbolSelector
              symbols={symbols}
              activeSymbol={activeSymbol}
              onSymbolChange={selectSymbol}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Ticks analysed</label>
            <Select value={String(sampleSize)} onValueChange={(v) => setSampleSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_SIZES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Last {n} ticks
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Over/Under barrier</label>
            <Select value={String(barrier)} onValueChange={(v) => setBarrier(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Barrier {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Left: current tick + streaks */}
        <Card className="border shadow-sm lg:col-span-1">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-center min-h-24">
              <CurrentTickDisplay
                tick={currentTick}
                lastDigit={lastDigit}
                activeSymbol={activeSymbol}
                pipSize={pipSize}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">Parity streak</div>
                <div className="mt-1 text-lg font-bold text-foreground">
                  {analysis.parityStreak
                    ? `${analysis.parityStreak.length}× ${analysis.parityStreak.parity}`
                    : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">Price streak</div>
                <div className="mt-1 text-lg font-bold text-foreground">
                  {analysis.priceStreak
                    ? `${analysis.priceStreak.length}× ${analysis.priceStreak.trend}`
                    : '—'}
                </div>
              </div>
            </div>

            {/* Even/Odd split */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Even {analysis.evenPct.toFixed(1)}%</span>
                <span className="font-medium text-foreground">{analysis.oddPct.toFixed(1)}% Odd</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-sky-500" style={{ width: `${analysis.evenPct}%` }} />
                <div className="h-full bg-violet-500" style={{ width: `${analysis.oddPct}%` }} />
              </div>
            </div>

            {/* Over/Under split */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Under {analysis.underPct.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">={analysis.equalPct.toFixed(1)}%</span>
                <span className="font-medium text-foreground">
                  {analysis.overPct.toFixed(1)}% Over
                </span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-red-500" style={{ width: `${analysis.underPct}%` }} />
                <div className="h-full bg-muted-foreground/40" style={{ width: `${analysis.equalPct}%` }} />
                <div className="h-full bg-green-500" style={{ width: `${analysis.overPct}%` }} />
              </div>
              <div className="mt-1 text-center text-[11px] text-muted-foreground">
                relative to barrier {analysis.barrier}
              </div>
            </div>

            <div className="text-center text-[11px] text-muted-foreground">
              Based on {analysis.totalTicks} ticks
            </div>
          </CardContent>
        </Card>

        {/* Middle: predictions */}
        <Card className="border shadow-sm lg:col-span-2">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Predictions</h2>
              <span className="text-[11px] text-muted-foreground">ranked by confidence</span>
            </div>
            {analysis.totalTicks === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                Waiting for tick data…
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.signals.map((signal, i) => (
                  <SignalCard key={signal.mode} signal={signal} top={i === 0} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Digit frequency distribution */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Digit frequency</h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> hottest {analysis.hottest.digit}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> coldest {analysis.coldest.digit}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1 sm:gap-2">
            {analysis.frequencies.map((f) => {
              const isHot = analysis.totalTicks > 0 && f.digit === analysis.hottest.digit;
              const isCold = analysis.totalTicks > 0 && f.digit === analysis.coldest.digit;
              const heightPct = maxPct > 0 ? (f.percentage / maxPct) * 100 : 0;
              return (
                <div key={f.digit} className="flex flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end sm:h-32">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all',
                        isHot ? 'bg-green-500' : isCold ? 'bg-red-500' : 'bg-primary/40'
                      )}
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-mono',
                      isHot && 'font-semibold text-green-500',
                      isCold && 'font-semibold text-red-500',
                      !isHot && !isCold && 'text-muted-foreground'
                    )}
                  >
                    {f.percentage.toFixed(0)}%
                  </span>
                  <span className="text-xs font-semibold text-foreground">{f.digit}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent digit sequence */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent digits</h2>
          {recentDigits.length === 0 ? (
            <div className="text-sm text-muted-foreground">No ticks yet.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {recentDigits.map((d, i) => {
                const isLatest = i === recentDigits.length - 1;
                return (
                  <span
                    key={i}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-semibold',
                      isLatest
                        ? 'bg-primary text-primary-foreground'
                        : d % 2 === 0
                          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                          : 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                    )}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="px-1 pb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        These figures describe the recent tick history only. Synthetic indices are
        random — past frequencies do not guarantee future outcomes. Trade responsibly.
      </p>
    </div>
  );
}
