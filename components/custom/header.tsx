'use client';

import { useState } from 'react';
import { Settings, Eye, EyeOff, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ThemeSelector } from '@/components/custom/theme-selector';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import type { AuthState, DerivAccount } from '@deriv/core';

interface HeaderProps {
  authState: AuthState;
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onLogin: () => Promise<void>;
  onLogout: () => void;
  onSwitchAccount: (accountId: string) => Promise<void>;
  /** When provided, a Sign up button is rendered to the right of the Log in button. */
  onSignUp?: () => Promise<void>;
  /** Live Deriv socket state — drives the connection status indicator. */
  isConnected?: boolean;
  /** Logo source URL or data URL. When omitted, the branded 1RB mark is shown. */
  logoSrc?: string;
  /** App name override (branding preview). Defaults to the 1RB AI brand. */
  appName?: string;
  /** Optional extra controls rendered left of the theme selector. */
  actions?: React.ReactNode;
}

function formatBalance(balance: string): string {
  return Number(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function AccountBadge({ type }: { type: 'demo' | 'real' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em]',
        type === 'demo'
          ? 'bg-amber-500/15 text-amber-400'
          : 'bg-primary/15 text-primary'
      )}
    >
      {type === 'demo' ? 'Demo' : 'Real'}
    </span>
  );
}

/** Brand mark — uploaded logo when present, else the gradient 1RB monogram. */
function BrandMark({ logoSrc }: { logoSrc?: string }) {
  const [logoError, setLogoError] = useState(false);
  if (logoSrc && !logoError) {
    // eslint-disable-next-line @next/next/no-img-element -- next/image errors when /logo.png is absent locally; plain img + onError gives a silent fallback.
    return (
      <img
        src={logoSrc}
        alt={`${BRAND.name} logo`}
        className="h-9 w-auto object-contain"
        onError={() => setLogoError(true)}
      />
    );
  }
  return (
    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-2))] shadow-glow">
      <span className="font-display text-sm font-bold tracking-tight text-[rgb(var(--primary-foreground))]">
        {BRAND.short}
      </span>
    </span>
  );
}

export function Header({
  authState,
  accounts,
  activeAccount,
  onLogin,
  onLogout,
  onSwitchAccount,
  onSignUp,
  isConnected,
  logoSrc,
  actions,
}: HeaderProps) {
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const isAuthenticated = authState === 'authenticated';
  const isAuthenticating = authState === 'authenticating';

  const balanceText = (acc: DerivAccount) =>
    balanceHidden ? '••••••' : `${formatBalance(acc.balance)} ${acc.currency}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <BrandMark logoSrc={logoSrc} />
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-wide text-brand-gradient">
                {BRAND.name}
              </span>
            </div>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
              {BRAND.tagline}
            </span>
          </div>

          {/* Connection status */}
          <div
            className={cn(
              'ml-1 hidden items-center gap-1.5 rounded-full border px-2.5 py-1 sm:flex',
              isConnected
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            )}
          >
            <span className={cn('live-dot h-1.5 w-1.5 rounded-full', isConnected ? 'bg-primary' : 'bg-amber-400')} />
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.16em]">
              {isConnected ? 'Live' : 'Connecting'}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {actions}

          {isAuthenticated && activeAccount && (
            <Popover open={accountSwitcherOpen} onOpenChange={setAccountSwitcherOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-2.5 py-1.5 backdrop-blur transition-colors hover:border-primary/40 hover:bg-card">
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <AccountBadge type={activeAccount.account_type} />
                      <span className="max-w-[90px] truncate font-mono text-[10px] text-muted-foreground">
                        {activeAccount.account_id}
                      </span>
                    </div>
                    <p className="tnum text-sm font-bold text-foreground">
                      {balanceText(activeAccount)}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      accountSwitcherOpen && 'rotate-180'
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-2">
                <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Accounts
                  </span>
                  <button
                    onClick={() => setBalanceHidden((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {balanceHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {balanceHidden ? 'Show' : 'Hide'}
                  </button>
                </div>
                <div className="space-y-1">
                  {accounts.map((account) => (
                    <button
                      key={account.account_id}
                      onClick={() => {
                        onSwitchAccount(account.account_id);
                        setAccountSwitcherOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors',
                        account.account_id === activeAccount.account_id
                          ? 'bg-muted ring-1 ring-inset ring-primary/30'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div>
                        <AccountBadge type={account.account_type} />
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {account.account_id}
                        </p>
                      </div>
                      <p className="tnum text-sm font-bold text-foreground">{balanceText(account)}</p>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <ThemeSelector />

          {/* Settings */}
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
              <p className="px-2 pb-1.5 pt-1 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Settings
              </p>
              <button
                onClick={() => setBalanceHidden((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  {balanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Balance privacy
                </span>
                <span
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    balanceHidden ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform',
                      balanceHidden ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </span>
              </button>
              <div className="my-1 h-px bg-border" />
              <div className="px-2 py-1 text-[11px] leading-relaxed text-muted-foreground">
                {BRAND.name} — {BRAND.tagline}. AI-assisted analysis of live Deriv
                synthetic markets.
              </div>
              {isAuthenticated && (
                <>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => {
                      onLogout();
                      setSettingsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect account
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>

          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onLogin} disabled={isAuthenticating}>
                {isAuthenticating ? 'Connecting…' : 'Log in'}
              </Button>
              {onSignUp && (
                <Button size="sm" onClick={onSignUp} disabled={isAuthenticating}>
                  Sign up
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
