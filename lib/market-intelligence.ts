import { getLastDigit } from './digit-stats';
import type { PredictionAnalysis, DigitFrequency, Signal } from './prediction-analysis';

/**
 * Market-intelligence layer for the 1RB AI analyzer.
 *
 * Everything here is derived *only* from the live tick window supplied by the
 * Deriv feed — volatility, drift, momentum and digit patterns are honest
 * descriptive statistics of what has already streamed in. Synthetic indices are
 * effectively random, so these read as leanings, never guarantees. No values are
 * fabricated; when there is too little data the readings degrade to "—".
 */

export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

export interface Metric {
  label: string;
  /** 0-100 gauge value where a bar/ring is drawn. */
  value: number;
  tone: Tone;
  /** Optional secondary detail line. */
  detail?: string;
}

export interface MarketIntelligence {
  condition: Metric;
  volatility: Metric;
  direction: Metric;
  trendStrength: Metric;
  momentum: Metric;
  patternStatus: Metric;
  /** Concrete patterns detected in the window (may be empty). */
  patterns: string[];
  ticks: number;
}

export interface DigitRank {
  digit: number;
  probability: number;
  status: 'Strong' | 'Neutral' | 'Weak';
}

export interface DigitIntelligence {
  hot: DigitFrequency[];
  cold: DigitFrequency[];
  /** Digits that did not occur at all in the window. */
  missing: number[];
  /** Current run of the same last-digit repeating at the tail. */
  digitStreak: { digit: number; length: number } | null;
  ranking: DigitRank[];
}

export interface AiSignal {
  /** Human label for the recommended side. */
  prediction: string;
  mode: Signal['mode'];
  /** Recommended digit where relevant (match/differ/over/under). */
  digit: number | null;
  confidence: number;
  probability: number;
  strength: 'Strong' | 'Moderate' | 'Weak';
  reasoning: string;
  pattern: string;
}

/** Population standard deviation. */
function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/**
 * Derive market condition, volatility, drift/direction, trend strength,
 * momentum and pattern recognition from a window of prices.
 */
export function computeMarketIntelligence(
  prices: number[],
  pipSize: number,
  sampleSize: number
): MarketIntelligence {
  const window = prices.slice(-sampleSize);
  const ticks = window.length;

  const empty = (label: string): Metric => ({ label, value: 0, tone: 'neutral' });
  if (ticks < 3) {
    return {
      condition: empty('Calibrating'),
      volatility: empty('—'),
      direction: empty('Neutral'),
      trendStrength: empty('—'),
      momentum: empty('—'),
      patternStatus: empty('Scanning'),
      patterns: [],
      ticks,
    };
  }

  // Percentage returns between consecutive ticks.
  const returns: number[] = [];
  for (let i = 1; i < window.length; i++) {
    const prev = window[i - 1];
    if (prev !== 0) returns.push(((window[i] - prev) / prev) * 100);
  }

  // Volatility — stddev of returns, scaled to a readable 0-100 gauge.
  const volPct = stddev(returns);
  const volGauge = clamp((volPct / 0.6) * 100);
  const volLabel =
    volGauge < 25 ? 'Low' : volGauge < 55 ? 'Moderate' : volGauge < 80 ? 'High' : 'Extreme';
  const volTone: Tone = volGauge < 25 ? 'good' : volGauge < 55 ? 'neutral' : volGauge < 80 ? 'warn' : 'bad';

  // Direction — net drift over the window.
  const netPct = window[0] !== 0 ? ((window[window.length - 1] - window[0]) / window[0]) * 100 : 0;
  let ups = 0;
  let downs = 0;
  for (const r of returns) {
    if (r > 0) ups++;
    else if (r < 0) downs++;
  }
  const directional = ups + downs;
  const bias = directional > 0 ? ((ups - downs) / directional) * 100 : 0;
  const dirLabel = bias > 8 ? 'Bullish' : bias < -8 ? 'Bearish' : 'Neutral';
  const dirTone: Tone = dirLabel === 'Neutral' ? 'neutral' : dirLabel === 'Bullish' ? 'good' : 'bad';

  // Trend strength — how one-sided the moves are, weighted by sample size.
  const consistency = Math.abs(bias);
  const sampleWeight = Math.min(1, ticks / 80);
  const trendGauge = clamp(consistency * sampleWeight);
  const trendLabel =
    trendGauge < 20 ? 'Ranging' : trendGauge < 50 ? 'Developing' : trendGauge < 75 ? 'Strong' : 'Dominant';

  // Momentum — recent quarter drift vs the whole window.
  const recentLen = Math.max(3, Math.floor(returns.length / 4));
  const recent = returns.slice(-recentLen);
  const recentMean = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
  const overallMean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const momentumRaw = recentMean - overallMean;
  const momentumGauge = clamp(50 + (momentumRaw / (volPct || 1)) * 25);
  const momentumLabel =
    momentumGauge > 62 ? 'Accelerating' : momentumGauge < 38 ? 'Fading' : 'Steady';
  const momentumTone: Tone =
    momentumGauge > 62 ? 'good' : momentumGauge < 38 ? 'warn' : 'neutral';

  // Overall condition combines volatility + trend.
  let conditionLabel: string;
  let conditionTone: Tone;
  let conditionValue: number;
  if (trendGauge >= 50) {
    conditionLabel = 'Trending';
    conditionTone = 'good';
    conditionValue = trendGauge;
  } else if (volGauge >= 80) {
    conditionLabel = 'Volatile';
    conditionTone = 'bad';
    conditionValue = volGauge;
  } else if (volGauge < 25) {
    conditionLabel = 'Compressed';
    conditionTone = 'warn';
    conditionValue = 100 - volGauge;
  } else {
    conditionLabel = 'Ranging';
    conditionTone = 'neutral';
    conditionValue = 100 - trendGauge;
  }

  // Pattern recognition — collect concrete detections.
  const digits = window.map((p) => getLastDigit(p, pipSize));
  const patterns = detectPatterns(digits, volGauge, trendGauge);
  const patternStatus: Metric = {
    label: patterns.length ? `${patterns.length} detected` : 'None active',
    value: clamp(patterns.length * 28),
    tone: patterns.length ? 'good' : 'neutral',
  };

  return {
    condition: { label: conditionLabel, value: conditionValue, tone: conditionTone },
    volatility: { label: volLabel, value: volGauge, tone: volTone, detail: `${volPct.toFixed(3)}% σ` },
    direction: { label: dirLabel, value: clamp(50 + bias / 2), tone: dirTone, detail: `${netPct >= 0 ? '+' : ''}${netPct.toFixed(3)}%` },
    trendStrength: { label: trendLabel, value: trendGauge, tone: trendGauge >= 50 ? 'good' : 'neutral' },
    momentum: { label: momentumLabel, value: momentumGauge, tone: momentumTone },
    patternStatus,
    patterns,
    ticks,
  };
}

/** Detect concrete, nameable patterns in the digit / volatility stream. */
function detectPatterns(digits: number[], volGauge: number, trendGauge: number): string[] {
  const found: string[] = [];
  const n = digits.length;
  if (n < 4) return found;

  // Repeating tail digit (compression toward one digit).
  const last = digits[n - 1];
  let run = 1;
  for (let i = n - 2; i >= 0 && digits[i] === last; i--) run++;
  if (run >= 3) found.push(`Digit ${last} repeating ×${run}`);

  // Parity run.
  let parityRun = 1;
  for (let i = n - 2; i >= 0 && digits[i] % 2 === last % 2; i--) parityRun++;
  if (parityRun >= 5) found.push(`${last % 2 === 0 ? 'Even' : 'Odd'} streak ×${parityRun}`);

  // Alternating parity (even/odd/even/odd) over the last 6.
  const tail = digits.slice(-6);
  if (tail.length === 6 && tail.every((d, i) => (i === 0 ? true : d % 2 !== tail[i - 1] % 2))) {
    found.push('Alternating parity');
  }

  // Mirrored triple: last 3 == previous 3.
  if (n >= 6) {
    const a = digits.slice(-3).join('');
    const b = digits.slice(-6, -3).join('');
    if (a === b) found.push('Repeated 3-digit block');
  }

  if (volGauge < 22) found.push('Volatility compression');
  if (trendGauge >= 70) found.push('Strong directional bias');

  return found;
}

/** Hot/cold/missing digits, tail repetition, and a probability ranking. */
export function computeDigitIntelligence(analysis: PredictionAnalysis): DigitIntelligence {
  const { frequencies, totalTicks, digits } = analysis;
  const sorted = [...frequencies].sort((a, b) => b.percentage - a.percentage);
  const hot = totalTicks > 0 ? sorted.slice(0, 3) : [];
  const cold = totalTicks > 0 ? sorted.slice(-3).reverse() : [];
  const missing = frequencies.filter((f) => f.count === 0).map((f) => f.digit);

  // Tail digit repetition streak.
  let digitStreak: DigitIntelligence['digitStreak'] = null;
  if (digits.length > 0) {
    const last = digits[digits.length - 1];
    let length = 1;
    for (let i = digits.length - 2; i >= 0 && digits[i] === last; i--) length++;
    if (length >= 2) digitStreak = { digit: last, length };
  }

  const ranking: DigitRank[] = sorted.map((f) => ({
    digit: f.digit,
    probability: f.percentage,
    status: f.percentage >= 12 ? 'Strong' : f.percentage <= 8 ? 'Weak' : 'Neutral',
  }));

  return { hot, cold, missing, digitStreak, ranking };
}

/** Build the headline AI signal from the strongest prediction + intelligence. */
export function buildAiSignal(
  analysis: PredictionAnalysis,
  intel: MarketIntelligence
): AiSignal | null {
  if (analysis.totalTicks === 0 || analysis.signals.length === 0) return null;
  const top = analysis.signals[0];
  const strength: AiSignal['strength'] =
    top.confidence >= 60 ? 'Strong' : top.confidence >= 30 ? 'Moderate' : 'Weak';

  const pattern = intel.patterns[0] ?? `${intel.condition.label.toLowerCase()} market`;

  const reasoningParts: string[] = [];
  reasoningParts.push(
    `${top.label} shows a ${top.probability.toFixed(1)}% observed rate across ${analysis.totalTicks} ticks`
  );
  reasoningParts.push(
    `deviating from the fair baseline in a ${intel.condition.label.toLowerCase()}, ${intel.volatility.label.toLowerCase()}-volatility regime`
  );
  if (intel.patterns[0]) reasoningParts.push(`pattern signal: ${intel.patterns[0].toLowerCase()}`);

  return {
    prediction: top.label,
    mode: top.mode,
    digit: top.barrier,
    confidence: top.confidence,
    probability: top.probability,
    strength,
    reasoning: reasoningParts.join('; ') + '.',
    pattern,
  };
}
