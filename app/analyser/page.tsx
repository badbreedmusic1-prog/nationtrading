'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBaseTrading } from '@/hooks/use-base-trading';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';
import { useLogoSrc } from '@/components/custom/logo-src-provider';
import { Header } from '@/components/custom/header';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import { Footer } from '@/components/custom/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { PredictionAnalyser } from '@/components/prediction-analyser';
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
    <main className="flex flex-col bg-background max-lg:h-dvh max-lg:overflow-y-auto lg:min-h-dvh">
      <Header
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={login}
        onSignUp={signUp}
        onLogout={logout}
        onSwitchAccount={switchAccount}
        logoSrc={logoSrc}
        actions={<ThemeToggle />}
      />

      {/* Spacer to push content below fixed header — taller when authenticated */}
      <div className={authState === 'authenticated' ? 'h-[76px] shrink-0' : 'h-[66px] shrink-0'} />

      <div className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="text-base leading-none">←</span>
            <span>Back to trading</span>
          </Link>
          <h1 className="text-base font-semibold text-foreground sm:text-lg">Prediction Analyser</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          <PredictionAnalyser
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
      <div className="fixed bottom-0 left-0 right-0 py-2 text-center bg-background/80 backdrop-blur-sm">
        <Footer />
      </div>
    </main>
  );
}
