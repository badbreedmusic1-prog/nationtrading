'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useBaseTrading } from '@/hooks/use-base-trading';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';
import { useLogoSrc } from '@/components/custom/logo-src-provider';
import { Header } from '@/components/custom/header';
import { Footer } from '@/components/custom/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { AiAnalyzer } from '@/components/analyzer/ai-analyzer';
import { getLastDigit } from '@/lib/digit-stats';

const DIGIT_CONTRACT_TYPES = [
  'DIGITMATCH',
  'DIGITDIFF',
  'DIGITOVER',
  'DIGITUNDER',
  'DIGITEVEN',
  'DIGITODD',
];

export default function AnalyserPage() {
  const logoSrc = useLogoSrc();
  const { ws, isConnected, isExhausted, auth } = useDerivWSContext();
  const { authState, accounts, activeAccount, login, signUp, logout, switchAccount } = auth;

  const {
    isLoading,
    symbols,
    activeSymbol,
    selectSymbol,
    currentTick,
    prices,
    pipSize,
  } = useBaseTrading({
    ws,
    isConnected,
    isExhausted,
    isAuthenticated: !!auth.wsUrl,
    onAuthWSFailed: logout,
    contractTypes: DIGIT_CONTRACT_TYPES,
  });

  const [sampleSize, setSampleSize] = useState<number>(100);
  const [barrier, setBarrier] = useState<number>(5);

  const lastDigit = useMemo(() => {
    if (currentTick) return getLastDigit(currentTick.quote, pipSize);
    if (prices.length > 0) return getLastDigit(prices[prices.length - 1], pipSize);
    return null;
  }, [currentTick, prices, pipSize]);

  return (
    <main className="terminal-bg flex flex-col bg-background max-lg:h-dvh max-lg:overflow-y-auto lg:min-h-dvh">
      <Header
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={login}
        onSignUp={signUp}
        onLogout={logout}
        onSwitchAccount={switchAccount}
        logoSrc={logoSrc}
        isConnected={isConnected}
      />

      {/* Spacer to push content below the fixed header */}
      <div className="h-[72px] shrink-0" />

      <div className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 pb-14 sm:px-4 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="text-base leading-none">←</span>
            <span>Back to terminal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="font-display text-base font-bold uppercase tracking-[0.14em] text-foreground sm:text-lg">
              AI Market Analyzer
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-[520px] w-full rounded-2xl" />
              <Skeleton className="h-[520px] w-full rounded-2xl lg:col-span-2" />
            </div>
          </div>
        ) : (
          <AiAnalyzer
            symbols={symbols}
            activeSymbol={activeSymbol}
            selectSymbol={selectSymbol}
            currentTick={currentTick}
            lastDigit={lastDigit}
            prices={prices}
            pipSize={pipSize}
            sampleSize={sampleSize}
            setSampleSize={setSampleSize}
            barrier={barrier}
            setBarrier={setBarrier}
          />
        )}
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 py-2 text-center backdrop-blur-sm">
        <Footer />
      </div>
    </main>
  );
}
