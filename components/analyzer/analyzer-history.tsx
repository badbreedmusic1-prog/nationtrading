'use client';

import { History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignalHistoryStats } from '@/hooks/use-signal-history';

export function AnalyzerHistory({ stats }: { stats: SignalHistoryStats }) {
  const { records, total, wins, accuracy } = stats;
  const recent = records.slice(-12).reverse();

  // Cumulative accuracy series for the sparkline.
  let cum = 0;
  const series = records.map((r, i) => {
    cum += r.win ? 1 : 0;
    return ((cum / (i + 1)) * 100);
  });

  return (
    <section className="glass animate-fade-up rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
          Analyzer History
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Signals" value={String(total)} />
        <Stat label="Winning" value={String(wins)} tone="good" />
        <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} tone={accuracy >= 50 ? 'good' : 'bad'} />
      </div>

      {/* Performance sparkline (cumulative accuracy) */}
      <div className="mt-4">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Accuracy curve
        </p>
        <Sparkline series={series} />
      </div>

      {/* Recent resolved signals */}
      <div className="mt-4">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recent results</p>
        {recent.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">
            Signals resolve here as new ticks arrive.
          </p>
        ) : (
          <div className="space-y-1">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-2.5 py-1.5"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      r.win ? 'bg-primary' : 'bg-destructive'
                    )}
                  />
                  <span className="text-xs font-medium text-foreground">{r.prediction}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="tnum text-[11px] text-muted-foreground">
                    got {r.actualDigit}
                  </span>
                  <span
                    className={cn(
                      'font-display text-[11px] font-bold uppercase',
                      r.win ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {r.win ? 'Win' : 'Loss'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-2.5 text-center">
      <p
        className={cn(
          'font-display text-2xl font-bold',
          tone === 'good' ? 'text-primary' : tone === 'bad' ? 'text-destructive' : 'text-foreground'
        )}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const W = 300;
  const H = 56;
  if (series.length < 2) {
    return (
      <div className="flex h-14 items-center justify-center rounded-lg border border-border bg-card/40 text-[11px] text-muted-foreground">
        Collecting data…
      </div>
    );
  }
  const step = W / (series.length - 1);
  const pts = series.map((v, i) => `${i * step},${H - (v / 100) * H}`).join(' ');
  const area = `0,${H} ${pts} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-14 w-full">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--brand))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(var(--brand))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 50% reference line */}
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="rgb(var(--muted-foreground) / 0.25)" strokeDasharray="3 3" />
      <polygon points={area} fill="url(#spark-fill)" />
      <polyline
        points={pts}
        fill="none"
        stroke="rgb(var(--brand))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
