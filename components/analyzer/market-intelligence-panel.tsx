'use client';

import { Activity } from 'lucide-react';
import { MetricGauge } from './visuals';
import type { MarketIntelligence } from '@/lib/market-intelligence';

export function MarketIntelligencePanel({ intel }: { intel: MarketIntelligence }) {
  return (
    <section className="glass animate-fade-up rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
            Market Intelligence
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {intel.ticks} ticks
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        <MetricGauge title="Condition" label={intel.condition.label} value={intel.condition.value} tone={intel.condition.tone} />
        <MetricGauge title="Volatility" label={intel.volatility.label} value={intel.volatility.value} tone={intel.volatility.tone} detail={intel.volatility.detail} />
        <MetricGauge title="Direction" label={intel.direction.label} value={intel.direction.value} tone={intel.direction.tone} detail={intel.direction.detail} />
        <MetricGauge title="Trend strength" label={intel.trendStrength.label} value={intel.trendStrength.value} tone={intel.trendStrength.tone} />
        <MetricGauge title="Momentum" label={intel.momentum.label} value={intel.momentum.value} tone={intel.momentum.tone} />
        <MetricGauge title="Patterns" label={intel.patternStatus.label} value={intel.patternStatus.value} tone={intel.patternStatus.tone} />
      </div>

      {intel.patterns.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {intel.patterns.map((p) => (
            <span
              key={p}
              className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
