'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchJustTcgPriceHistory,
  type JustTcgPriceAnalytics,
  type JustTcgVariant,
  type JustTcgVariantPriceHistoryPoint,
  type JustTcgTimePeriod,
} from '@/lib/justTcgApi';
import { getTypeColor } from '@/lib/typeColors';
import styles from './PricingAnalytics.module.scss';

interface PricingAnalyticsProps {
  cardId: string;
  cardName: string;
  setName: string;
  cardNumber: string;
  typeColor: {
    glow: string;
    gradient: string;
    accent: string;
  };
}

type ConditionName =
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged';

const PERIODS: JustTcgTimePeriod[] = ['7d', '30d', '90d'];

const ALL_CONDITIONS: ConditionName[] = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
];

const CONDITION_ORDER: ConditionName[] = [...ALL_CONDITIONS];
const NEAR_MINT: ConditionName = 'Near Mint';

function normalizeCondition(input: string | undefined | null): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function formatPrice(val: number, currency = '$') {
  if (!Number.isFinite(val)) return 'N/A';
  return currency === '€' ? `${val.toFixed(2).replace('.', ',')} €` : `$${val.toFixed(2)}`;
}

function formatDateLabel(unixSeconds: number) {
  const d = new Date(Number(unixSeconds) * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type SeriesPoint = { t: number; y: number };

type ConditionSeries = {
  condition: ConditionName;
  points: SeriesPoint[];
  min: number;
  max: number;
  latest: number;
  first: number;
  avg: number;
  pointsCount: number;
  changePct: number;
};

function toSeriesPoints(priceHistory: JustTcgVariantPriceHistoryPoint[] | undefined) {
  const sorted = (priceHistory || [])
    .filter((pt) => typeof pt?.t === 'number' && typeof pt?.p === 'number' && pt.p > 0)
    .sort((a, b) => Number(a.t) - Number(b.t));

  return sorted.map((pt) => ({ t: pt.t, y: pt.p }));
}

function calcMinMax(points: SeriesPoint[]) {
  const ys = points.map((p) => p.y).filter((y) => Number.isFinite(y) && y > 0);
  if (!ys.length) return { min: 0, max: 0 };
  return { min: Math.min(...ys), max: Math.max(...ys) };
}

function calcAvg(points: SeriesPoint[]) {
  if (!points.length) return 0;
  const sum = points.reduce((acc, p) => acc + p.y, 0);
  return sum / points.length;
}

function calcChangePct(points: SeriesPoint[]) {
  if (points.length < 2) return 0;
  const first = points[0].y;
  const last = points[points.length - 1].y;
  if (!first || !Number.isFinite(first)) return 0;
  return ((last - first) / first) * 100;
}

function pickConditionVariant(variants: JustTcgVariant[], condition: ConditionName) {
  const target = normalizeCondition(condition);
  return variants
    .filter((v) => normalizeCondition(v.condition) === target)
    .map((v) => ({ v, pointsCount: (v.priceHistory || []).filter((pt) => typeof pt?.t === 'number' && typeof pt?.p === 'number' && pt.p > 0).length }))
    .sort((a, b) => Number(b.pointsCount) - Number(a.pointsCount))[0]?.v;
}

export default function PricingAnalytics({ cardId, cardName, setName, cardNumber, typeColor }: PricingAnalyticsProps) {
  const [data, setData] = useState<JustTcgPriceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<JustTcgTimePeriod>('90d');


  // Dedupe in-flight fetches to avoid double-call in dev StrictMode.
  const inflightRef = useRef<Map<string, Promise<JustTcgPriceAnalytics>>>(new Map());

  useEffect(() => {
    let isMounted = true;

    async function loadPriceData() {
      setLoading(true);
      setError(null);

      try {
        const q = `${cardName} from ${setName} with number ${cardNumber}`.trim();
        const key = `${q}|${cardNumber}|pokemon|${selectedPeriod}`;

        let promise = inflightRef.current.get(key);
        if (!promise) {
          promise = fetchJustTcgPriceHistory({
            q,
            number: cardNumber,
            game: 'pokemon',
            timePeriod: '90d',
          });
          inflightRef.current.set(key, promise);
        }

        const priceData = await promise;
        if (!isMounted) return;
        setData(priceData);
      } catch (err) {
        console.error('Price analytics error:', err);
        if (isMounted) setError('Unable to load price data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPriceData();

    return () => {
      isMounted = false;
    };
  }, [cardId, cardName, setName, cardNumber]);

  const variants: JustTcgVariant[] = data?.data?.[0]?.variants || [];

  const tcgPlayerId: string | undefined = (() => {
    const first = data?.data?.[0];
    if (!first) return undefined;
    const maybeId = (first as unknown as { tcgplayerId?: unknown }).tcgplayerId;
    if (maybeId === undefined || maybeId === null) return undefined;
    return String(maybeId);
  })();

  const currency = '$';

  const conditionColors = useMemo(() => {
    // Deterministic distinct colors (5) derived from accent to keep theme cohesive.
    // We use a small fixed palette (still looks good with your theme) and rely on module styling.
    return {
      'Near Mint': '#49f7a3',
      'Lightly Played': '#60a5fa',
      'Moderately Played': '#fbbf24',
      'Heavily Played': '#fb923c',
      Damaged: '#ff5b6b',
    } satisfies Record<ConditionName, string>;
  }, []);

  const periodCutoffMs = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (selectedPeriod === '7d') return now - 7 * dayMs;
    if (selectedPeriod === '30d') return now - 30 * dayMs;
    return now - 90 * dayMs;
  }, [selectedPeriod]);

  const seriesByCondition: ConditionSeries[] = useMemo(() => {
    const result: ConditionSeries[] = [];

    for (const condition of CONDITION_ORDER) {
      const bestVariant = pickConditionVariant(variants, condition);
      const pointsAll = toSeriesPoints(bestVariant?.priceHistory);
      const points = pointsAll.filter((pt) => Number(pt.t) * 1000 >= periodCutoffMs);

      const { min, max } = calcMinMax(points);
      const avg = calcAvg(points);
      const latest = points.length ? points[points.length - 1].y : 0;
      const first = points.length ? points[0].y : 0;
      const pointsCount = points.length;
      const changePct = calcChangePct(points);

      result.push({
        condition,
        points,
        min,
        max,
        latest,
        first,
        avg,
        pointsCount,
        changePct,
      });
    }

    return result;
  }, [variants, periodCutoffMs]);

  const sharedMinMax = useMemo(() => {
    const all = seriesByCondition.flatMap((s) => s.points.map((p) => p.y));
    const ys = all.filter((y) => Number.isFinite(y) && y > 0);
    if (!ys.length) return { min: 0, max: 0, yRange: 1 };
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    return { min, max, yRange: (max - min) || 1 };
  }, [seriesByCondition]);

  const allTimes = useMemo(() => {
    // Unified timestamps across conditions for consistent tooltip.
    const tSet = new Set<number>();
    for (const s of seriesByCondition) {
      for (const pt of s.points) tSet.add(pt.t);
    }
    return Array.from(tSet.values()).sort((a, b) => Number(a) - Number(b));
  }, [seriesByCondition]);

  const [tooltip, setTooltip] = useState<{
    open: boolean;
    t: number;
    x: number;
    y: number;
  }>({ open: false, t: 0, x: 0, y: 0 });

  const chartDims = { width: 720, height: 190, padX: 18, padY: 18 };

  // Tooltip depends on values that require stable hooks.
  // NOTE: svgPaths is memoized so it can be referenced by mouse handlers.
  const svgPaths = useMemo(() => {

    const { width, height, padX, padY } = chartDims;
    const tsMin = allTimes[0] ?? 0;
    const tsMax = allTimes[allTimes.length - 1] ?? 1;
    const tRange = (tsMax - tsMin) || 1;
    const { min, yRange } = sharedMinMax;

    const x = (t: number) => {
      const u = (t - tsMin) / tRange;
      return padX + u * (width - padX * 2);
    };

    const y = (v: number) => {
      const u = (v - min) / yRange;
      return height - padY - u * (height - padY * 2);
    };

    const paths = seriesByCondition.map((s) => {
      const d = s.points
        .map((pt, i) => {
          const cmd = i === 0 ? 'M' : 'L';
          return `${cmd} ${x(pt.t).toFixed(2)} ${y(pt.y).toFixed(2)}`;
        })
        .join(' ');

      const last = s.points[s.points.length - 1];
      return {
        condition: s.condition,
        d,
        color: conditionColors[s.condition],
        start: s.points[0] ? { x: x(s.points[0].t), y: y(s.points[0].y) } : null,
        end: last ? { x: x(last.t), y: y(last.y) } : null,
        yAt: (t: number) => {
          // Find nearest point by timestamp.
          let best: SeriesPoint | null = null;
          let bestDist = Infinity;
          for (const pt of s.points) {
            const dist = Math.abs(Number(pt.t) - Number(t));
            if (dist < bestDist) {
              bestDist = dist;
              best = pt;
            }
          }
          if (!best) return null;
          return y(best.y);
        },
      };
    });

    return { paths, x, y, tsMin, tsMax };
  }, [seriesByCondition, allTimes, sharedMinMax, conditionColors]);

  const latestSeries = seriesByCondition.find((s) => s.condition === NEAR_MINT) ?? seriesByCondition[0];
  // Keep hooks unconditional: helpers that depend on tooltip state should be declared before any early returns.
  const overallAvg = useMemo(() => {

    const avgs = seriesByCondition.map((s) => s.latest);
    const sum = avgs.reduce((acc, v) => acc + v, 0);
    return sum / (avgs.length || 1);
  }, [seriesByCondition]);

  const overallMin = useMemo(() => {
    const mins = seriesByCondition.map((s) => s.min).filter((v) => Number.isFinite(v));
    return mins.length ? Math.min(...mins) : 0;
  }, [seriesByCondition]);

  const overallMax = useMemo(() => {
    const maxs = seriesByCondition.map((s) => s.max).filter((v) => Number.isFinite(v));
    return maxs.length ? Math.max(...maxs) : 0;
  }, [seriesByCondition]);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;

    // Map relX to a timestamp via linear interpolation.
    const { tsMin, tsMax, x } = svgPaths;
    const { width } = chartDims;
    if (!allTimes.length) return;

    const xMin = chartDims.padX;
    const xMax = width - chartDims.padX;
    const u = Math.min(1, Math.max(0, (relX - xMin) / (xMax - xMin)));
    const tEst = tsMin + u * (tsMax - tsMin);

    // Nearest timestamp in unified set.
    let bestT = allTimes[0];
    let bestDist = Infinity;
    for (const t of allTimes) {
      const d = Math.abs(Number(t) - Number(tEst));
      if (d < bestDist) {
        bestDist = d;
        bestT = t;
      }
    }

    // Tooltip y based on avg y at nearest timestamp.
    const avgY = seriesByCondition
      .map((s) => {
        // nearest in series
        let best: SeriesPoint | null = null;
        let bestDist = Infinity;
        for (const pt of s.points) {
          const dist = Math.abs(Number(pt.t) - Number(bestT));
          if (dist < bestDist) {
            bestDist = dist;
            best = pt;
          }
        }
        return best ? svgPaths.y(best.y) : null;
      })
      .filter((v): v is number => typeof v === 'number');

    const yPx = avgY.length ? avgY.reduce((a, b) => a + b, 0) / avgY.length : 20;

    const xPx = x(bestT);

    setTooltip({ open: true, t: bestT, x: xPx, y: yPx });
  };

  const handleMouseLeave = () => {
    setTooltip((t) => ({ ...t, open: false }));
  };

  const selectedPeriodMeta = useMemo(() => {
    // Use NEAR_MINT series for meta placeholder.
    const nm = seriesByCondition.find((s) => s.condition === NEAR_MINT);
    if (!nm) return { change: 0, trend: 'neutral' as const, marketActivity: 0 };

    const change = nm.changePct;
    const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral';
    const marketActivity = nm.pointsCount;
    return { change, trend, marketActivity };
  }, [seriesByCondition]);

  // Important: never place hooks *after* conditional returns.
  // We compute tooltipValues unconditionally above; the UI can conditionally render.

  const periodLabel = selectedPeriod;

  const shouldShowChart = !loading && !error && !!data;

  const tooltipValues = useMemo(() => {
    const t = tooltip.t;
    const values = seriesByCondition.map((s) => {
      let best: SeriesPoint | null = null;
      let bestDist = Infinity;
      for (const pt of s.points) {
        const dist = Math.abs(Number(pt.t) - Number(t));
        if (dist < bestDist) {
          bestDist = dist;
          best = pt;
        }
      }
      return { condition: s.condition, price: best?.y ?? 0 };
    });
    return values;
  }, [tooltip.t, seriesByCondition]);

  if (!shouldShowChart) {
    return (
      <div className={styles.analyticsSection}>
        <h2 className={styles.sectionTitle}>Price Analytics</h2>
        {loading ? (
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonChart} />
            <div className={styles.skeletonStats}>
              {[40, 50, 60].map((w, i) => (
                <div key={i} className={styles.skeletonStat} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.errorState}>
            <p className={styles.errorText}>{error || 'Price data unavailable'}</p>
            <p className={styles.errorSubtext}>Unable to fetch price history at this time.</p>
          </div>
        )}
      </div>
    );
  }


  const progressFill = (() => {
    if (!overallMax || overallMax <= overallMin) return 0;
    const u = (overallAvg - overallMin) / (overallMax - overallMin);
    return Math.min(1, Math.max(0, u));
  })();

  const trendClass =
    selectedPeriodMeta.trend === 'up'
      ? styles.changeUp
      : selectedPeriodMeta.trend === 'down'
        ? styles.changeDown
        : styles.changeNeutral;

  const segmentButtons = (
    <div className={styles.segmented}>
      {PERIODS.map((p) => (
        <button
          key={p}
          className={`${styles.segmentBtn} ${p === selectedPeriod ? styles.segmentBtnActive : ''}`}
          onClick={() => setSelectedPeriod(p)}
          type="button"
        >
          {p}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.analyticsSection}>
      <div className={styles.analyticsHeader}>
        <h2 className={styles.sectionTitle}>Price Analytics</h2>
        <div className={styles.controlsRow}>
          <div className={styles.timePeriodTabs}>
            {/* Reuse existing visual tabs class; use as dropdown-style buttons for 7/30/90 */}
            <span
              className={styles.periodTabActive}
              style={{ display: 'none' }}
            />
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.periodTab} ${p === selectedPeriod ? styles.periodTabActive : ''}`}
                onClick={() => setSelectedPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.dropdownBtn}
            aria-label="Select period"
            onClick={() => {
              // simple cycle for now to keep code small
              const idx = PERIODS.indexOf(selectedPeriod);
              const next = PERIODS[(idx + 1) % PERIODS.length];
              setSelectedPeriod(next);
            }}
          >
            Period {periodLabel}
            <span className={styles.dropdownChevron} />
          </button>
        </div>
      </div>

      {/* Snapshot stats */}
      <div className={styles.statsStack}>
        <div className={styles.snapshotCard}>
          <div className={styles.snapshotTitle}>
            <h3>Near Mint</h3>
            <div className={styles.matrixMetaRow}>
              <span className={styles.tcgPlayerLabel}>TCGPlayer</span>
              <span className={styles.tcgPlayerValue} style={{ color: typeColor.accent }}>{tcgPlayerId ?? 'N/A'}</span>
            </div>
          </div>

          <div className={styles.snapshotMainPrice}>{formatPrice(latestSeries?.latest ?? 0, currency)}</div>
          <div className={styles.snapshotSub}>Current price ({periodLabel})</div>

          <div className={styles.kvGrid}>
            <div className={styles.kvItem}>
              <div className={styles.kvLabel}>24h Change</div>
              <div className={styles.kvValue}>
                {/* fallback: use derived meta */}
                {Number.isFinite(selectedPeriodMeta.change)
                  ? `${selectedPeriodMeta.change >= 0 ? '+' : ''}${selectedPeriodMeta.change.toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
            <div className={styles.kvItem}>
              <div className={styles.kvLabel}>Range</div>
              <div className={styles.kvValue}>
                {formatPrice(latestSeries?.min ?? 0, currency)} - {formatPrice(latestSeries?.max ?? 0, currency)}
              </div>
            </div>
          </div>

          <div className={styles.changeRow}>
            <span className={trendClass}>
              {selectedPeriodMeta.trend === 'up' ? '▲' : selectedPeriodMeta.trend === 'down' ? '▼' : '•'}
            </span>
            <span className={trendClass}>
              {selectedPeriodMeta.trend === 'neutral' ? 'Stable' : selectedPeriodMeta.trend === 'up' ? 'Rising' : 'Falling'}
            </span>
          </div>
        </div>

        <div className={styles.chartCard} />

        {/* Variant matrix */}
        <div className={styles.matrixBlock}>
          <div className={styles.matrixHeader}>
            <div>
              <div className={styles.matrixTitle}>Variant Matrix</div>
              <div className={styles.matrixSubMeta}>Hover chart for per-timestamp prices</div>
            </div>
            <div className={styles.matrixMetaRow}>
              <span className={styles.matrixCategory} style={{ color: typeColor.accent }}>
                {periodLabel}
              </span>
            </div>
          </div>

          <div className={styles.matrixRows}>
            {seriesByCondition.map((s) => (
              <div key={s.condition} className={styles.matrixRow}>
                <div className={styles.matrixCond}>
                  <span
                    aria-hidden
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: conditionColors[s.condition],
                      marginRight: 8,
                      boxShadow: `0 0 18px ${conditionColors[s.condition]}55`,
                      border: `2px solid rgba(255,255,255,0.12)`,
                    }}
                  />
                  {s.condition}
                </div>
                <div className={styles.matrixPriceCol}>
                  <div className={styles.matrixPrice}>{formatPrice(s.latest, currency)}</div>
                  <div className={styles.matrixTrendRow}>
                    {s.changePct > 0.5 ? '▲' : s.changePct < -0.5 ? '▼' : '•'}
                    <span style={{ marginLeft: 6 }}>
                      {`${s.changePct >= 0 ? '+' : ''}${s.changePct.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-line chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader} />
          <div className={styles.multiChartWrap}>
            <div
              className={styles.multiChartWrap}
              style={{ position: 'relative' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <svg
                viewBox={`0 0 ${chartDims.width} ${chartDims.height}`}
                className={styles.multiChartCanvas}
                role="img"
                aria-label="Price movement chart"
              >
                {/* baseline grid */}
                {Array.from({ length: 4 }).map((_, i) => {
                  const y = chartDims.padY + ((chartDims.height - chartDims.padY * 2) * (i + 1)) / 5;
                  return (
                    <line
                      key={i}
                      x1={chartDims.padX}
                      x2={chartDims.width - chartDims.padX}
                      y1={y}
                      y2={y}
                      className={styles.crosshairLine}
                      style={{ strokeDasharray: '4 6', strokeWidth: 1 }}
                    />
                  );
                })}

                {svgPaths.paths.map((p) => (
                  <path
                    key={p.condition}
                    d={p.d}
                    fill="none"
                    stroke={p.color}
                    strokeOpacity={0.8}
                    strokeWidth={2.5}
                  />
                ))}

                {/* crosshair */}
                {tooltip.open && (
                  <line
                    x1={tooltip.x}
                    x2={tooltip.x}
                    y1={chartDims.padY}
                    y2={chartDims.height - chartDims.padY}
                    className={styles.crosshairLine}
                    style={{ stroke: 'rgba(255,255,255,0.25)' }}
                  />
                )}
              </svg>

              {tooltip.open && (
                <div
                  className={styles.hoverTooltip}
                  style={{
                    left: Math.min(chartDims.width - 280, Math.max(10, tooltip.x + 10)),
                    top: Math.max(8, tooltip.y - 10),
                  }}
                >
                  <div className={styles.hoverDate}>{formatDateLabel(tooltip.t)}</div>
                  <div className={styles.hoverMaxRow}>Max (all conditions) {formatPrice(Math.max(...seriesByCondition.map((s) => s.max)), currency)}</div>
                  {tooltipValues.map((v) => (
                    <div key={v.condition} className={styles.hoverCondRow}>
                      <div className={styles.hoverCondLeft}>
                        <span
                          className={styles.hoverDot}
                          style={{
                            background: conditionColors[v.condition],
                            borderColor: 'rgba(255,255,255,0.16)',
                            boxShadow: `0 0 18px ${conditionColors[v.condition]}66`,
                          }}
                        />
                        <span>{v.condition}</span>
                      </div>
                      <div className={styles.hoverPrice}>{formatPrice(v.price, currency)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Period card + progress */}
        <div className={styles.snapshotCard}>
          <div className={styles.periodCardTop}>
            <div>
              <div className={styles.matrixTitle}>Period Snapshot</div>
              <div className={styles.matrixSubMeta}>Segments & market activity</div>
            </div>
            {segmentButtons}
          </div>

          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
              <span>{formatPrice(overallMin, currency)}</span>
              <span>{formatPrice(overallMax, currency)}</span>
            </div>
            <div className={styles.rangeBar}>
              <div className={styles.rangeFill} style={{ width: `${(progressFill * 100).toFixed(0)}%` }} />
              <div
                className={styles.rangeKnob}
                style={{ left: `${(progressFill * 100).toFixed(0)}%` }}
              />
            </div>
            <div className={styles.progressLegend}>Avg current price: {formatPrice(overallAvg, currency)}</div>
          </div>

          <div className={styles.metaRows}>
            <div className={styles.metaRow}>
              <div className={styles.metaKey}>Price Change</div>
              <div className={styles.metaVal}>{selectedPeriodMeta.change >= 0 ? '+' : ''}{selectedPeriodMeta.change.toFixed(2)}%</div>
            </div>
            <div className={styles.metaRow}>
              <div className={styles.metaKey}>Trend</div>
              <div className={styles.metaVal}>
                {selectedPeriodMeta.trend === 'neutral' ? 'Stable' : selectedPeriodMeta.trend === 'up' ? 'Uptrend' : 'Downtrend'}
              </div>
            </div>
            <div className={styles.metaRow}>
              <div className={styles.metaKey}>Market Activity</div>
              <div className={styles.metaVal}>{selectedPeriodMeta.marketActivity} points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

