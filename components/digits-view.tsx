'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/custom/footer';
import { Header } from '@/components/custom/header';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentTickDisplay } from './current-tick-display';
import { DigitStatsBar } from './digit-stats-bar';
import { TradeControls } from './trade-controls';
import { TradeTypeChips } from '@/components/custom/trade-type-chips';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import type {
  AuthState,
  DerivAccount,
  ActiveSymbol,
  Tick,
  ProposalInfo,
  DurationLimits,
  BuyResult,
} from '@deriv/core';
import type { ContractMode, TradeType, DigitStats } from '../lib/types';

const DIGIT_TRADE_TYPE_OPTIONS: { value: TradeType; label: string }[] = [
  { value: 'matches-differs', label: 'Matches/Differs' },
  { value: 'over-under', label: 'Over/Under' },
  { value: 'even-odd', label: 'Even/Odd' },
];

export interface DigitsViewProps {
  // Auth
  authState: AuthState;
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onLogin: () => Promise<void>;
  onSignUp: () => Promise<void>;
  onLogout: () => void;
  onSwitchAccount: (accountId: string) => Promise<void>;

  // Connection / loading
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Market data
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  selectSymbol: (symbol: string) => void;
  currentTick: Tick | null;
  lastDigit: number | null;
  digitStats: DigitStats;
  pipSize: number;

  // Trade controls
  tradeType: TradeType;
  setTradeType: (type: TradeType) => void;
  contractMode: ContractMode;
  setContractMode: (mode: ContractMode) => void;
  selectedDigit: number;
  setSelectedDigit: (digit: number) => void;
  stake: string;
  setStake: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  durationLimits: DurationLimits;
  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  buyContract: () => Promise<void>;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  clearBuyResult: () => void;
  // Branding (used by preview route; no-op in the real app)
  logoSrc?: string;
  appName?: string;
}

export function DigitsView({
  authState,
  accounts,
  activeAccount,
  onLogin,
  onSignUp,
  onLogout,
  onSwitchAccount,
  isConnected,
  isLoading,
  error,
  symbols,
  activeSymbol,
  selectSymbol,
  currentTick,
  lastDigit,
  digitStats,
  pipSize,
  tradeType,
  setTradeType,
  contractMode,
  setContractMode,
  selectedDigit,
  setSelectedDigit,
  stake,
  setStake,
  duration,
  setDuration,
  durationLimits,
  proposal,
  isProposalLoading,
  buyContract,
  isBuying,
  buyResult,
  buyError,
  clearBuyResult,
  logoSrc,
  appName,
}: DigitsViewProps) {
  if (error) {
    return (
      <main className="terminal-bg flex min-h-dvh flex-col items-center justify-center bg-background px-4">
        <Card className="glass w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="terminal-bg flex flex-col bg-background max-lg:h-dvh max-lg:overflow-y-auto lg:overflow-visible">
      <Header
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={onLogin}
        onSignUp={onSignUp}
        onLogout={onLogout}
        onSwitchAccount={onSwitchAccount}
        logoSrc={logoSrc}
        appName={appName}
        isConnected={isConnected}
      />
      {/* Spacer to push content below the fixed header */}
      <div className="h-[72px] shrink-0" />

      {/* Scrollable content area — sits between header and sticky buy bar on mobile */}
      <div className="mx-auto flex w-full max-w-7xl flex-none flex-col gap-3 px-3 py-3 pb-10 sm:px-4 sm:py-4 lg:overflow-visible">
        {isLoading ? (
          <>
            {/* Trade type chips skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            {/* Main card skeleton */}
            <Skeleton className="h-[420px] w-full rounded-2xl" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <TradeTypeChips
                  value={tradeType}
                  options={DIGIT_TRADE_TYPE_OPTIONS}
                  onValueChange={setTradeType}
                />
              </div>
            </div>

            <Card className="glass mb-12 shrink-0 rounded-2xl">
              <CardContent className="flex flex-col p-3 pb-2 pt-3 sm:p-6 sm:pb-6 sm:pt-4">
                <div
                  className={`lg:grid lg:overflow-visible ${tradeType !== 'even-odd' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
                >
                  {/* Column 1: Symbol selector + tick display */}
                  <div className="flex flex-col pb-4 pt-1 sm:pb-6 sm:pt-2 lg:py-0 lg:pr-6">
                    <SymbolSelector
                      symbols={symbols}
                      activeSymbol={activeSymbol}
                      onSymbolChange={selectSymbol}
                    />
                    <div className="flex min-h-24 items-center justify-center sm:min-h-32 lg:flex-1">
                      <CurrentTickDisplay
                        tick={currentTick}
                        lastDigit={lastDigit}
                        activeSymbol={activeSymbol}
                        pipSize={pipSize}
                      />
                    </div>
                  </div>

                  {/* Columns 2+3 wrapper: stacked on mobile, transparent on desktop */}
                  <div className="divide-y divide-border max-lg:border-t lg:contents">
                    {/* Column 2: Digit stats — hidden for Even/Odd */}
                    {tradeType !== 'even-odd' && (
                      <div className="py-4 sm:py-6 lg:border-l lg:border-border lg:px-6 lg:py-0">
                        <DigitStatsBar
                          digitStats={digitStats}
                          selectedDigit={selectedDigit}
                          onDigitSelect={setSelectedDigit}
                        />
                      </div>
                    )}

                    {/* Column 3: Trade controls */}
                    <div className="pt-4 sm:pt-6 lg:border-l lg:border-border lg:pl-6 lg:pt-0">
                      <TradeControls
                        tradeType={tradeType}
                        contractMode={contractMode}
                        onContractModeChange={setContractMode}
                        selectedDigit={selectedDigit}
                        isConnected={isConnected}
                        stake={stake}
                        onStakeChange={setStake}
                        duration={duration}
                        onDurationChange={setDuration}
                        durationLimits={durationLimits}
                        proposal={proposal}
                        isProposalLoading={isProposalLoading}
                        onBuy={buyContract}
                        isBuying={isBuying}
                        buyResult={buyResult}
                        buyError={buyError}
                        onClearBuyResult={clearBuyResult}
                        isAuthenticated={authState === 'authenticated'}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 py-2 text-center backdrop-blur-sm">
        <Footer />
      </div>
    </main>
  );
}
