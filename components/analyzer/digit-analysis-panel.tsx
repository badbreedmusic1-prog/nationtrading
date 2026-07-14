'use client';

import { BarChart3, Flame, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PredictionAnalysis } from '@/lib/prediction-analysis';
import type { DigitIntelligence } from '@/lib/market-intelligence';

const RANK_STYLES = {
  Strong: 'text-primary',
  Neutral: 'text-muted-foreground',
  Weak: 'text-destructive',
} as const;

export function DigitAnalysisPanel({
  analysis,
  digitIntel,
}: {
  analysis: PredictionAnalysis;
  digitIntel: DigitIntelligence;
}) {
  const maxPct = Math.max(...analysis.frequencies.map((f) => f.percentage), 0);
  const recent = analysis.digits.slice(-24);

  return (
    <section className="glass animate-fade-up rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
            Digit Analysis
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Last {analysis.totalTicks} ticks
        </span>
      </div>

      {analysis.totalTicks === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Waiting for tick data…
        </div>
      ) : (
        <div className="space-y-4">
          {/* Occurrence chart */}
          <div className="grid grid-cols-10 gap-1 sm:gap-2">
            {analysis.frequencies.map((f) => {
              const isHot = f.digit === analysis.hottest.digit;
              const isCold = f.digit === analysis.coldest.digit;
              const h = maxPct > 0 ? (f.percentage / maxPct) * 100 : 0;
              return (
                <div key={f.digit} className="flex flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end sm:h-28">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all duration-500',
                        isHot
                          ? 'bg-gradient-to-t from-[rgb(var(--brand))] to-[rgb(var(--brand-2))]'
                          : isCold
                            ? 'bg-destructive/70'
                            : 'bg-muted-foreground/25'
                      )}
                      style={{ height: `${Math.max(h, 3)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'tnum text-[10px]',
                      isHot && 'font-semibold text-primary',
                      isCold && 'font-semibold text-destructive',
                      !isHot && !isCold && 'text-muted-foreground'
                    )}
                  >
                    {f.percentage.toFixed(0)}
                  </span>
                  <span className="font-display text-xs font-semibold text-foreground">{f.digit}</span>
                </div>
              );
            })}
          </div>

          {/* Hot / cold / missing / streak summary */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <SummaryTile icon={<Flame className="h-3.5 w-3.5 text-primary" />} title="Hot">
              <div className="flex gap-1">
                {digitIntel.hot.map((d) => (
                  <Chip key={d.digit} tone="hot">{d.digit}</Chip>
                ))}
              </div>
            </SummaryTile>
            <SummaryTile icon={<Snowflake className="h-3.5 w-3.5 text-destructive" />} title="Cold">
              <div className="flex gap-1">
                {digitIntel.cold.map((d) => (
                  <Chip key={d.digit} tone="cold">{d.digit}</Chip>
                ))}
              </div>
            </SummaryTile>
            <SummaryTile title="Missing">
              {digitIntel.missing.length ? (
                <div className="flex flex-wrap gap-1">
                  {digitIntel.missing.map((d) => (
                    <Chip key={d} tone="muted">{d}</Chip>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </SummaryTile>
            <SummaryTile title="Streak">
              {digitIntel.digitStreak ? (
                <span className="font-display text-lg font-bold text-foreground">
                  {digitIntel.digitStreak.digit}
                  <span className="ml-1 text-xs text-primary">×{digitIntel.digitStreak.length}</span>
                </span>
              ) : analysis.parityStreak ? (
                <span className="font-display text-sm font-bold text-foreground">
                  {analysis.parityStreak.length}× {analysis.parityStreak.parity}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </SummaryTile>
          </div>

          {/* Even/Odd + Over/Under splits */}
          <div className="grid gap-3 sm:grid-cols-2">
            <SplitBar
              leftLabel={`Even ${analysis.evenPct.toFixed(1)}%`}
              rightLabel={`${analysis.oddPct.toFixed(1)}% Odd`}
              segments={[
                { pct: analysis.evenPct, className: 'bg-primary' },
                { pct: analysis.oddPct, className: 'bg-[rgb(var(--brand-2))]' },
              ]}
            />
            <SplitBar
              leftLabel={`Under ${analysis.underPct.toFixed(1)}%`}
              rightLabel={`${analysis.overPct.toFixed(1)}% Over`}
              segments={[
                { pct: analysis.underPct, className: 'bg-destructive/70' },
                { pct: analysis.equalPct, className: 'bg-muted-foreground/40' },
                { pct: analysis.overPct, className: 'bg-primary' },
              ]}
            />
          </div>

          {/* Probability ranking */}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Probability ranking
            </p>
            <div className="space-y-1.5">
              {digitIntel.ranking.slice(0, 5).map((r) => (
                <div key={r.digit} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-foreground">
                    {r.digit}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand-2))]"
                      style={{ width: `${Math.min(100, r.probability * 5)}%` }}
                    />
                  </div>
                  <span className="tnum w-12 text-right text-xs text-muted-foreground">
                    {r.probability.toFixed(1)}%
                  </span>
                  <span className={cn('w-14 text-right text-[11px] font-semibold', RANK_STYLES[r.status])}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent digit stream */}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recent stream</p>
            <div className="flex flex-wrap gap-1">
              {recent.map((d, i) => {
                const isLatest = i === recent.length - 1;
                return (
                  <span
                    key={i}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-semibold',
                      isLatest
                        ? 'bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] text-[rgb(var(--primary-foreground))]'
                        : d % 2 === 0
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryTile({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: 'hot' | 'cold' | 'muted' }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold',
        tone === 'hot' && 'bg-primary/15 text-primary',
        tone === 'cold' && 'bg-destructive/15 text-destructive',
        tone === 'muted' && 'bg-muted text-muted-foreground'
      )}
    >
      {children}
    </span>
  );
}

function SplitBar({
  leftLabel,
  rightLabel,
  segments,
}: {
  leftLabel: string;
  rightLabel: string;
  segments: { pct: number; className: string }[];
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s, i) => (
          <div key={i} className={s.className} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
    </div>
  );
}
