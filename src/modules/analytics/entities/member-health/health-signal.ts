export type FavorableDirection = 'rising' | 'falling';

export type Trend = 'rising' | 'falling' | 'stable';

export type HealthIndicator = 'green' | 'orange' | 'red';

export type SignalEpsilon =
  | { kind: 'absolute'; amount: number }
  | { kind: 'relative'; amount: number };

export interface ComputeHealthSignalParams {
  values: ReadonlyArray<number | null>;
  favorableDirection: FavorableDirection;
  epsilon: SignalEpsilon;
}

export type HealthSignalResult =
  | { isApplicable: false }
  | {
      isApplicable: true;
      hasEnoughHistory: false;
      lastValue: number | null;
      trend: null;
      indicator: null;
    }
  | {
      isApplicable: true;
      hasEnoughHistory: true;
      lastValue: number;
      trend: Trend;
      indicator: HealthIndicator;
    };

const MINIMUM_CYCLES_FOR_TREND = 3;

function keepNonNull(values: ReadonlyArray<number | null>): number[] {
  const result: number[] = [];
  for (const value of values) {
    if (value !== null) result.push(value);
  }
  return result;
}

function signOfDelta(
  previousValue: number,
  currentValue: number,
  epsilon: SignalEpsilon,
): -1 | 0 | 1 {
  const delta = currentValue - previousValue;
  const threshold =
    epsilon.kind === 'absolute'
      ? epsilon.amount
      : Math.abs(previousValue) * epsilon.amount;

  if (Math.abs(delta) <= threshold) return 0;
  return delta > 0 ? 1 : -1;
}

function trendFromLastRun(lastRunSign: -1 | 0 | 1): Trend {
  if (lastRunSign === 0) return 'stable';
  return lastRunSign > 0 ? 'rising' : 'falling';
}

function isTrendFavorable(
  trend: Trend,
  favorableDirection: FavorableDirection,
): boolean {
  if (trend === 'stable') return true;
  return trend === favorableDirection;
}

function lastNonZeroSign(signs: ReadonlyArray<-1 | 0 | 1>): -1 | 0 | 1 {
  for (let index = signs.length - 1; index >= 0; index--) {
    const sign = signs[index];
    if (sign !== 0) return sign;
  }
  return 0;
}

function lastRunLengthOfSign(
  signs: ReadonlyArray<-1 | 0 | 1>,
  targetSign: -1 | 0 | 1,
): number {
  let length = 0;
  for (let index = signs.length - 1; index >= 0; index--) {
    if (signs[index] === targetSign) length++;
    else break;
  }
  return length;
}

export function computeHealthSignal(
  params: ComputeHealthSignalParams,
): HealthSignalResult {
  const nonNullValues = keepNonNull(params.values);

  if (nonNullValues.length === 0) {
    return { isApplicable: false };
  }

  if (nonNullValues.length < MINIMUM_CYCLES_FOR_TREND) {
    return {
      isApplicable: true,
      hasEnoughHistory: false,
      lastValue: nonNullValues[nonNullValues.length - 1],
      trend: null,
      indicator: null,
    };
  }

  const signs: Array<-1 | 0 | 1> = [];
  for (let index = 1; index < nonNullValues.length; index++) {
    signs.push(
      signOfDelta(
        nonNullValues[index - 1],
        nonNullValues[index],
        params.epsilon,
      ),
    );
  }

  const dominantSign = lastNonZeroSign(signs);
  const trend = trendFromLastRun(dominantSign);
  const lastValue = nonNullValues[nonNullValues.length - 1];

  if (trend === 'stable') {
    return {
      isApplicable: true,
      hasEnoughHistory: true,
      lastValue,
      trend,
      indicator: 'green',
    };
  }

  const favorable = isTrendFavorable(trend, params.favorableDirection);

  if (favorable) {
    return {
      isApplicable: true,
      hasEnoughHistory: true,
      lastValue,
      trend,
      indicator: 'green',
    };
  }

  const runLength = lastRunLengthOfSign(signs, dominantSign);
  const indicator: HealthIndicator = runLength >= 2 ? 'red' : 'orange';

  return {
    isApplicable: true,
    hasEnoughHistory: true,
    lastValue,
    trend,
    indicator,
  };
}
