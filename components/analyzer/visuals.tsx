'use client';

import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/market-intelligence';

const TONE_TEXT: Record<Tone, string> = {
  good: 'text-primary',
  warn: 'text-amber-400',
  bad: 'text-destructive',
  neutral: 'text-muted-foreground',
};

const TONE_BAR: Record<Tone, string> = {
  good: 'bg-primary',
  warn: 'bg-amber-400',
  bad: 'bg-destructive',
  neutral: 'bg-muted-foreground/60',
};

/** Circular confidence ring (SVG) with a value in the center. */
export function ConfidenceRing({
  value,
  size = 132,
  stroke = 10,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--brand))" />
            <stop offset="100%" stopColor="rgb(var(--brand-2))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum font-display text-3xl font-bold text-foreground">{Math.round(v)}%</span>
        {label && (
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}

/** Labelled horizontal gauge for a market-intelligence metric. */
export function MetricGauge({
  title,
  label,
  value,
  tone,
  detail,
}: {
  title: string;
  label: string;
  value: number;
  tone: Tone;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</span>
        {detail && <span className="tnum text-[10px] text-muted-foreground">{detail}</span>}
      </div>
      <div className={cn('mt-1 font-display text-lg font-bold', TONE_TEXT[tone])}>{label}</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', TONE_BAR[tone])}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

/** Small confidence bar used inside signal cards. */
export function ConfidenceMeter({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] transition-all duration-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
