'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Zap, ArrowRight, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContractMode } from '@/lib/types';
import type { AiSignal } from '@/lib/market-intelligence';

const CONTRACT_LABELS: Record<ContractMode, string> = {
  DIGITMATCH: 'Matches',
  DIGITDIFF: 'Differs',
  DIGITOVER: 'Over',
  DIGITUNDER: 'Under',
  DIGITEVEN: 'Even',
  DIGITODD: 'Odd',
};

/**
 * Advisory trading-control surface for the analyzer. It configures the
 * strategy (contract type, stake, ticks) and can mirror the AI signal, but
 * execution stays on the trading terminal — no orders are placed from here.
 */
export function TradingControlPanel({ signal }: { signal: AiSignal | null }) {
  const [autoTrade, setAutoTrade] = useState(false);
  const [stake, setStake] = useState('10');
  const [ticks, setTicks] = useState(1);
  const [contract, setContract] = useState<ContractMode>('DIGITEVEN');

  const syncToSignal = () => {
    if (signal) setContract(signal.mode);
  };

  return (
    <section className="glass animate-fade-up rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
            Trade Control
          </h2>
        </div>
        <button
          onClick={syncToSignal}
          disabled={!signal}
          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
        >
          <Wand2 className="h-3 w-3" /> Sync to AI
        </button>
      </div>

      {/* Auto Trade toggle */}
      <button
        onClick={() => setAutoTrade((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition-colors',
          autoTrade ? 'border-primary/40 bg-primary/10' : 'border-border bg-card/40'
        )}
      >
        <span className="flex items-center gap-2">
          <Zap className={cn('h-4 w-4', autoTrade ? 'text-primary' : 'text-muted-foreground')} />
          <span className="text-sm font-medium text-foreground">Auto Trade</span>
        </span>
        <span
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors',
            autoTrade ? 'bg-primary' : 'bg-muted-foreground/30'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform',
              autoTrade ? 'translate-x-4' : 'translate-x-0.5'
            )}
          />
        </span>
      </button>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Stake</Label>
          <Input
            type="number"
            value={stake}
            min={0}
            step="0.01"
            onChange={(e) => setStake(e.target.value)}
            labelRight="USD"
            className="tnum"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Ticks</Label>
          <Input
            type="number"
            value={ticks}
            min={1}
            max={10}
            step={1}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setTicks(Math.max(1, v));
            }}
            labelRight="Ticks"
            className="tnum"
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Contract type</Label>
        <Select value={contract} onValueChange={(v) => setContract(v as ContractMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CONTRACT_LABELS) as ContractMode[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CONTRACT_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {autoTrade && (
        <p className="mt-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Auto Trade is following the live AI signal. Orders are executed from the
          trading terminal so you stay in control of every purchase.
        </p>
      )}

      <Button
        asChild
        className="mt-3 h-11 w-full rounded-full bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] font-display text-sm font-bold tracking-wide text-[rgb(var(--primary-foreground))] shadow-glow hover:brightness-110"
      >
        <Link href="/">
          Execute on terminal
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
