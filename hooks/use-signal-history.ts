'use client';

import { useEffect, useRef, useState } from 'react';
import type { AiSignal } from '@/lib/market-intelligence';

export interface SignalRecord {
  id: number;
  prediction: string;
  mode: AiSignal['mode'];
  digit: number | null;
  confidence: number;
  actualDigit: number;
  win: boolean;
}

export interface SignalHistoryStats {
  records: SignalRecord[];
  total: number;
  wins: number;
  accuracy: number;
}

/** Does the signal's predicted side hold for the actually-observed digit? */
function evaluate(signal: AiSignal, digit: number): boolean {
  switch (signal.mode) {
    case 'DIGITEVEN':
      return digit % 2 === 0;
    case 'DIGITODD':
      return digit % 2 === 1;
    case 'DIGITOVER':
      return signal.digit != null && digit > signal.digit;
    case 'DIGITUNDER':
      return signal.digit != null && digit < signal.digit;
    case 'DIGITMATCH':
      return signal.digit != null && digit === signal.digit;
    case 'DIGITDIFF':
      return signal.digit != null && digit !== signal.digit;
    default:
      return false;
  }
}

const MAX_RECORDS = 40;

/**
 * Tracks the analyzer's own live accuracy: each tick, the signal generated on
 * the *previous* tick is resolved against the digit that just arrived. This is
 * honest backtesting on the real Deriv feed — no simulated trades. History is
 * in-session (rolling window) and resets on reload, which is correct for a
 * live signal-quality meter.
 *
 * @param signal   Current headline signal (predicts the next digit).
 * @param lastDigit The digit of the newest tick.
 * @param tickKey  A value that changes exactly once per new tick.
 */
export function useSignalHistory(
  signal: AiSignal | null,
  lastDigit: number | null,
  tickKey: number | string | null
): SignalHistoryStats {
  const [records, setRecords] = useState<SignalRecord[]>([]);
  const pending = useRef<AiSignal | null>(null);
  const idRef = useRef(0);
  const lastKey = useRef<typeof tickKey>(null);

  useEffect(() => {
    if (tickKey == null || tickKey === lastKey.current) return;
    lastKey.current = tickKey;

    // Resolve the previous tick's signal against the digit that just arrived.
    if (pending.current && lastDigit != null) {
      const resolved = pending.current;
      const win = evaluate(resolved, lastDigit);
      setRecords((prev) => {
        const next: SignalRecord = {
          id: idRef.current++,
          prediction: resolved.prediction,
          mode: resolved.mode,
          digit: resolved.digit,
          confidence: resolved.confidence,
          actualDigit: lastDigit,
          win,
        };
        return [...prev, next].slice(-MAX_RECORDS);
      });
    }

    // Snapshot the current signal to resolve on the next tick.
    pending.current = signal;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on tickKey only
  }, [tickKey]);

  const total = records.length;
  const wins = records.filter((r) => r.win).length;
  const accuracy = total > 0 ? (wins / total) * 100 : 0;

  return { records, total, wins, accuracy };
}
