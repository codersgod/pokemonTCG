import { NextRequest, NextResponse } from 'next/server';

const JUSTTCG_API_KEY = 'tcg_c279c0af734140ef9cbbc1035d9e8835';
const JUSTTCG_BASE_URL = 'https://api.justtcg.com/v1/cards';

type TimePeriod = '7d' | '30d' | '90d';

type JustTcgVariantPriceHistoryPoint = {
  p: number;
  t: number; // unix seconds
};

type JustTcgVariant = {
  condition?: string;
  printing?: string;
  language?: string;
  price?: number;
  priceHistory?: JustTcgVariantPriceHistoryPoint[];
  lastUpdated?: number;
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
  stddevPopPrice30d?: number;
  covPrice30d?: number;
  priceChangesCount7d?: number;
  priceRelativeTo30dRange?: number;
};

type JustTcgCardResponse = {
  data?: Array<{
    name?: string;
    variants?: JustTcgVariant[];
  }>;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get('q') || '';
  // client will always slice locally, but we still forward timePeriod for backwards compat
  const timePeriod = (searchParams.get('timePeriod') || '90d') as TimePeriod;

  // NOTE: number is embedded into the `q` string by the client.
  if (!q) {
    return NextResponse.json({ error: 'Missing required param: q' }, { status: 400 });
  }

  // Always fetch 90d from JustTCG once; UI will slice to 7d/30d locally.
  const params = new URLSearchParams({
    q,
    game: 'pokemon',
    timePeriod: '90d',
  });

  const url = `${JUSTTCG_BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-api-key': JUSTTCG_API_KEY,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: `JustTCG request failed: ${res.status}` }, { status: 502 });
    }

    const json = (await res.json()) as JustTcgCardResponse;

    // Pass through the raw JustTCG structure (so client can use data[0].variants[*].priceHistory)
    return NextResponse.json({ ...json, timePeriod });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from JustTCG' }, { status: 500 });
  }
}



