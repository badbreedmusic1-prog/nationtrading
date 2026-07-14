'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { LineChart, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type {
  ContractMode,
  TradeType,
  DurationLimits,
  ProposalInfo,
  BuyResult,
} from '../lib/types';

interface TradeControlsProps {
  tradeType: TradeType;
  contractMode: ContractMode;
  onContractModeChange: (mode: ContractMode) => void;
  selectedDigit: number;
  isConnected: boolean;
  stake: string;
  onStakeChange: (value: string) => void;
  duration: number;
  onDurationChange: (value: number) => void;
  durationLimits: DurationLimits;
  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  onBuy: () => void;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  onClearBuyResult: () => void;
  isAuthenticated?: boolean;
}

const CONTRACT_MODE_OPTIONS: Record<TradeType, { value: ContractMode; label: string }[]> = {
  'matches-differs': [
    { value: 'DIGITMATCH', label: 'Matches' },
    { value: 'DIGITDIFF', label: 'Differs' },
  ],
  'over-under': [
    { value: 'DIGITOVER', label: 'Over' },
    { value: 'DIGITUNDER', label: 'Under' },
  ],
  'even-odd': [
    { value: 'DIGITEVEN', label: 'Even' },
    { value: 'DIGITODD', label: 'Odd' },
  ],
};

function getPredictionText(contractMode: ContractMode): string {
  switch (contractMode) {
    case 'DIGITMATCH':
      return 'match';
    case 'DIGITDIFF':
      return 'differ from';
    case 'DIGITOVER':
      return 'be over';
    case 'DIGITUNDER':
      return 'be under';
    case 'DIGITEVEN':
      return 'be even';
    case 'DIGITODD':
      return 'be odd';
  }
}

function showDigitInPrediction(contractMode: ContractMode): boolean {
  return contractMode !== 'DIGITEVEN' && contractMode !== 'DIGITODD';
}

export function TradeControls({
  tradeType,
  contractMode,
  onContractModeChange,
  selectedDigit,
  isConnected,
  stake,
  onStakeChange,
  duration,
  onDurationChange,
  durationLimits,
  proposal,
  isProposalLoading,
  onBuy,
  isBuying,
  buyResult,
  buyError,
  onClearBuyResult,
  isAuthenticated,
}: TradeControlsProps) {
  useEffect(() => {
    if (buyError) {
      toast.error('Purchase Failed', { description: buyError });
      onClearBuyResult();
    }
  }, [buyError, onClearBuyResult]);

  useEffect(() => {
    if (buyResult) {
      toast.success('Contract Purchased', {
        description: `Buy price: ${buyResult.buyPrice.toFixed(2)} USD | Payout: ${buyResult.payout.toFixed(2)} USD | Balance: ${buyResult.balanceAfter.toFixed(2)} USD`,
      });
      onClearBuyResult();
    }
  }, [buyResult, onClearBuyResult]);

  const modeOptions = CONTRACT_MODE_OPTIONS[tradeType];

  return (
    <div className="space-y-3 sm:space-y-4">
      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Trade control
      </span>

      <ToggleGroup
        type="single"
        value={contractMode}
        onValueChange={(value) => {
          if (value) onContractModeChange(value as ContractMode);
        }}
        className="w-full gap-1 rounded-full border border-border bg-muted/40 p-1"
      >
        {modeOptions.map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className="flex-1 rounded-full text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=on]:bg-primary data-[state=on]:font-bold data-[state=on]:text-primary-foreground data-[state=on]:shadow-glow"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="stake" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Stake
          </Label>
          <Input
            id="stake"
            type="number"
            value={stake}
            onChange={(e) => onStakeChange(e.target.value)}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            min={0}
            step="0.01"
            labelRight="USD"
            className="tnum"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Ticks
          </Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onDurationChange(val);
            }}
            min={durationLimits.min}
            max={durationLimits.max}
            step={1}
            labelRight="Ticks"
            className="tnum"
          />
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-card/50 p-3 backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Prediction</p>
        <p className="text-sm font-medium">
          Last digit will{' '}
          <span className="font-bold text-primary">{getPredictionText(contractMode)}</span>
          {showDigitInPrediction(contractMode) && (
            <>
              {' '}
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] font-mono text-xs font-bold text-[rgb(var(--primary-foreground))]">
                {selectedDigit}
              </span>
            </>
          )}
        </p>
        {(proposal || isProposalLoading) && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">Potential payout</span>
            {isProposalLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="tnum text-sm font-bold text-primary">
                {proposal!.payout.toFixed(2)} USD
              </span>
            )}
          </div>
        )}
      </div>

      {/* Buy button — fixed above footer on mobile, inline on desktop */}
      <div className="max-lg:fixed max-lg:bottom-[calc(env(safe-area-inset-bottom)+2.5rem)] max-lg:left-3 max-lg:right-3 lg:static">
        <Button
          className="h-11 w-full rounded-full bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] px-8 font-display text-base font-bold tracking-wide text-[rgb(var(--primary-foreground))] shadow-glow transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
          disabled={!isConnected || !proposal || isBuying}
          onClick={onBuy}
        >
          {isBuying
            ? 'Purchasing…'
            : proposal
              ? `Buy · ${proposal.askPrice.toFixed(2)} USD`
              : 'Buy contract'}
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link href="/analyser">
            <LineChart className="h-4 w-4" />
            Open AI analyzer
          </Link>
        </Button>
        {isAuthenticated && (
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Link href="/reports">
              <ListChecks className="h-4 w-4" />
              View your positions
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
