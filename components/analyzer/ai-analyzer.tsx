'use client';

import { useMemo } from 'react';
import { Radar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import { analysePredictions } from '@/lib/prediction-analysis';
import {
  computeMarketIntelligence,
  computeDigitIntelligence,
  buildAiSignal,
} from '@/lib/market-intelligence';
import { useSignalHistory } from '@/hooks/use-signal-history';
import { MarketIntelligencePanel } from './market-intelligence-panel';
import { AiSignalPanel } from './ai-signal-panel';
import { DigitAnalysisPanel } from './digit-analysis-panel';
import { AnalyzerHistory } from './analyzer-history';
import { TradingControlPanel } from './trading-control-panel';
import type { ActiveSymbol, Tick } from '@deriv/core';

const SAMPLE_SIZES = [25, 50, 100, 250, 500, 1000];

export interface AiAnalyzerProps {
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

export function AiAnalyzer({
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
}: AiAnalyzerProps) {
  const analysis = useMemo(
    () => analysePredictions(prices, pipSize, sampleSize, barrier),
    [prices, pipSize, sampleSize, barrier]
  );
  const intel = useMemo(
    () => computeMarketIntelligence(prices, pipSize, sampleSize),
    [prices, pipSize, sampleSize]
  );
  const digitIntel = useMemo(() => computeDigitIntelligence(analysis), [analysis]);
  const signal = useMemo(() => buildAiSignal(analysis, intel), [analysis, intel]);

  const tickKey = currentTick ? `${currentTick.epoch}:${currentTick.quote}` : null;
  const history = useSignalHistory(signal, lastDigit, tickKey);
  const live = analysis.totalTicks > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Config bar */}
      <Card className="glass rounded-2xl">
        <CardContent className="grid gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Market</label>
            <SymbolSelector symbols={symbols} activeSymbol={activeSymbol} onSymbolChange={selectSymbol} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Ticks analysed</label>
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
            <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Over/Under barrier</label>
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left rail: signal, history, control */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <AiSignalPanel signal={signal} live={live} />
          <AnalyzerHistory stats={history} />
          <TradingControlPanel signal={signal} />
        </div>

        {/* Right: intelligence + digit analysis */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <MarketIntelligencePanel intel={intel} />
          <DigitAnalysisPanel analysis={analysis} digitIntel={digitIntel} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-2 text-center">
        <Radar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          All readings are descriptive statistics of the live tick window. Synthetic
          indices are random — past frequencies never guarantee future outcomes. Trade responsibly.
        </p>
      </div>
    </div>
  );
}
