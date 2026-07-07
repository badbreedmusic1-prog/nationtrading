import { getLastDigit } from './digit-stats';

/**
 * Statistical prediction analysis derived purely from a window of tick prices.
 *
 * Everything here is descriptive frequency analysis of past ticks — synthetic
 * indices are effectively random, so these figures describe what *has* happened,
 * not a guarantee of what will. The UI surfaces them as leanings, not certainties.
 */

export type Trend = 'higher' | 'lower' | 'flat';

export interface DigitFrequency {
  digit: number;
  count: number;
  percentage: number;
}

export interface Signal {
  /** Human label for the recommended side, e.g. "Even", "Over 4", "Differs from 3". */
  label: string;
  /** The contract mode this signal maps to. */
  mode: 'DIGITMATCH' | 'DIGITDIFF' | 'DIGITOVER' | 'DIGITUNDER' | 'DIGITEVEN' | 'DIGITODD';
  /** Barrier digit where relevant (match/differ/over/under), otherwise null. */
  barrier: number | null;
  /** Observed probability (0-100) of the recommended side over the window. */
  probability: number;
  /**
   * Confidence 0-100 — how far the observed probability deviates from what a
   * fair, uniform distribution would produce, scaled by sample size.
   */
  confidence: number;
}

export interface PredictionAnalysis {
  totalTicks: number;
  /** Digits (0-9) ordered as they appear in the window (oldest → newest). */
  digits: number[];
  /** Per-digit frequency, index 0-9. */
  frequencies: DigitFrequency[];
  /** Hottest (most frequent) digit over the window. */
  hottest: DigitFrequency;
  /** Coldest (least frequent) digit over the window. */
  coldest: DigitFrequency;
  evenPct: number;
  oddPct: number;
  /** Percentage of ticks strictly over / under / equal to the barrier digit. */
  overPct: number;
  underPct: number;
  equalPct: number;
  barrier: number;
  /** Current run of consecutive even (or odd) last-digits, with parity. */
  parityStreak: { parity: 'even' | 'odd'; length: number } | null;
  /** Current run of consecutive higher/lower price moves. */
  priceStreak: { trend: Trend; length: number } | null;
  /** Recommended signals, strongest confidence first. */
  signals: Signal[];
}

const EMPTY_FREQ: DigitFrequency = { digit: 0, count: 0, percentage: 0 };

/**
 * Confidence score: absolute deviation from the fair baseline, normalised so a
 * large, consistent skew approaches 100. Damped by sample size so a handful of
 * ticks never reads as high confidence.
 */
function confidenceScore(observedPct: number, fairPct: number, sampleSize: number): number {
  if (sampleSize === 0) return 0;
  const deviation = Math.abs(observedPct - fairPct);
  // Scale the deviation relative to the fair baseline (max possible skew is
  // 100 - fairPct), then dampen for small samples (full weight ~120+ ticks).
  const maxDeviation = Math.max(fairPct, 100 - fairPct);
  const skew = maxDeviation > 0 ? deviation / maxDeviation : 0;
  const sampleWeight = Math.min(1, sampleSize / 120);
  return Math.round(Math.min(100, skew * 100 * sampleWeight));
}

/**
 * Analyse a window of prices and produce prediction signals.
 *
 * @param prices    Tick price history (oldest → newest).
 * @param pipSize   Decimal places used to extract the last digit.
 * @param sampleSize Only the most recent `sampleSize` ticks are analysed.
 * @param barrier   Barrier digit (0-9) for over/under analysis.
 */
export function analysePredictions(
  prices: number[],
  pipSize: number,
  sampleSize: number,
  barrier: number
): PredictionAnalysis {
  const window = prices.slice(-sampleSize);
  const digits = window.map((p) => getLastDigit(p, pipSize));
  const totalTicks = digits.length;

  const counts = new Array(10).fill(0);
  let evenCount = 0;
  let overCount = 0;
  let underCount = 0;
  let equalCount = 0;

  for (const d of digits) {
    counts[d]++;
    if (d % 2 === 0) evenCount++;
    if (d > barrier) overCount++;
    else if (d < barrier) underCount++;
    else equalCount++;
  }

  const pct = (n: number) => (totalTicks > 0 ? (n / totalTicks) * 100 : 0);

  const frequencies: DigitFrequency[] = counts.map((count, digit) => ({
    digit,
    count,
    percentage: pct(count),
  }));

  const sortedByFreq = [...frequencies].sort((a, b) => b.percentage - a.percentage);
  const hottest = totalTicks > 0 ? sortedByFreq[0] : EMPTY_FREQ;
  const coldest = totalTicks > 0 ? sortedByFreq[sortedByFreq.length - 1] : EMPTY_FREQ;

  const evenPct = pct(evenCount);
  const oddPct = pct(totalTicks - evenCount);
  const overPct = pct(overCount);
  const underPct = pct(underCount);
  const equalPct = pct(equalCount);

  // Fair baselines: 10% per digit; 50% even/odd; over/under depend on barrier.
  const fairOver = ((9 - barrier) / 10) * 100;
  const fairUnder = (barrier / 10) * 100;

  const signals: Signal[] = [];

  if (totalTicks > 0) {
    // Even / Odd
    if (evenPct >= oddPct) {
      signals.push({
        label: 'Even',
        mode: 'DIGITEVEN',
        barrier: null,
        probability: evenPct,
        confidence: confidenceScore(evenPct, 50, totalTicks),
      });
    } else {
      signals.push({
        label: 'Odd',
        mode: 'DIGITODD',
        barrier: null,
        probability: oddPct,
        confidence: confidenceScore(oddPct, 50, totalTicks),
      });
    }

    // Over / Under for the chosen barrier
    if (overPct >= underPct) {
      signals.push({
        label: `Over ${barrier}`,
        mode: 'DIGITOVER',
        barrier,
        probability: overPct,
        confidence: confidenceScore(overPct, fairOver, totalTicks),
      });
    } else {
      signals.push({
        label: `Under ${barrier}`,
        mode: 'DIGITUNDER',
        barrier,
        probability: underPct,
        confidence: confidenceScore(underPct, fairUnder, totalTicks),
      });
    }

    // Matches — the hottest digit is the strongest match candidate
    signals.push({
      label: `Matches ${hottest.digit}`,
      mode: 'DIGITMATCH',
      barrier: hottest.digit,
      probability: hottest.percentage,
      confidence: confidenceScore(hottest.percentage, 10, totalTicks),
    });

    // Differs — the coldest digit is the safest differ candidate
    signals.push({
      label: `Differs from ${coldest.digit}`,
      mode: 'DIGITDIFF',
      barrier: coldest.digit,
      probability: 100 - coldest.percentage,
      confidence: confidenceScore(coldest.percentage, 10, totalTicks),
    });
  }

  signals.sort((a, b) => b.confidence - a.confidence);

  return {
    totalTicks,
    digits,
    frequencies,
    hottest,
    coldest,
    evenPct,
    oddPct,
    overPct,
    underPct,
    equalPct,
    barrier,
    parityStreak: computeParityStreak(digits),
    priceStreak: computePriceStreak(window),
    signals,
  };
}

/** Length of the current run of same-parity last digits (from the newest tick back). */
function computeParityStreak(digits: number[]): PredictionAnalysis['parityStreak'] {
  if (digits.length === 0) return null;
  const last = digits[digits.length - 1];
  const parity: 'even' | 'odd' = last % 2 === 0 ? 'even' : 'odd';
  let length = 1;
  for (let i = digits.length - 2; i >= 0; i--) {
    if (digits[i] % 2 === last % 2) length++;
    else break;
  }
  return { parity, length };
}

/** Length of the current run of consecutive higher/lower price moves (newest back). */
function computePriceStreak(prices: number[]): PredictionAnalysis['priceStreak'] {
  if (prices.length < 2) return null;
  const dir = (a: number, b: number): Trend => (b > a ? 'higher' : b < a ? 'lower' : 'flat');
  const trend = dir(prices[prices.length - 2], prices[prices.length - 1]);
  if (trend === 'flat') return { trend, length: 1 };
  let length = 1;
  for (let i = prices.length - 2; i >= 1; i--) {
    if (dir(prices[i - 1], prices[i]) === trend) length++;
    else break;
  }
  return { trend, length };
}
