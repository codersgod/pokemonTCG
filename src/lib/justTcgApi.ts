export type JustTcgTimePeriod = '7d' | '30d' | '90d';

// PricingAnalytics UI currently expects the raw JustTCG response shape.
// Source: https://api.justtcg.com/v1/cards?q=...&number=...&game=pokemon&timePeriod=90d
export type JustTcgVariantPriceHistoryPoint = {
  p: number;
  t: number; // unix seconds
};

export type JustTcgVariant = {
  id?: string;
  condition?: string;
  printing?: string;
  language?: string;
  price?: number;
  lastUpdated?: number;
  priceHistory?: JustTcgVariantPriceHistoryPoint[];
  priceChange24hr?: number;
  priceChange7d?: number;
  priceChange30d?: number;
  priceChange90d?: number;
  avgPrice?: number;
  minPrice7d?: number;
  maxPrice7d?: number;
  avgPrice30d?: number;
  minPrice30d?: number;
  maxPrice30d?: number;
  avgPrice90d?: number;
  minPrice90d?: number;
  maxPrice90d?: number;
};

export type JustTcgCardResponse = {
  data?: Array<{
    name?: string;
    variants?: JustTcgVariant[];
  }>;
  timePeriod?: JustTcgTimePeriod;
};

export type JustTcgPriceAnalytics = JustTcgCardResponse;


export async function fetchJustTcgPriceHistory(params: {
  q: string;
  number?: string;
  game?: string;
  timePeriod?: JustTcgTimePeriod;
}): Promise<JustTcgPriceAnalytics> {
  const { q, timePeriod = '30d' } = params;

  // `q` is expected to include any card identifier details (ex: "... with number X / Y").
  // `number` query param is no longer required.
  const res = await fetch(
    `/api/justtcg/price-history?q=${encodeURIComponent(q)}&game=${encodeURIComponent(
      'pokemon'
    )}&timePeriod=${encodeURIComponent(timePeriod)}`,
    { method: 'GET', cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error(`JustTCG API failed: ${res.status}`);
  }

  return res.json();
}


