import { PokemonCard, CardSet, ApiResponse, CardFilters } from './types';

const BASE_URL = 'https://api.pokemontcg.io/v2';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_API_KEY;
  if (apiKey && apiKey !== 'YOUR_KEY') {
    headers['X-Api-Key'] = apiKey;
  }
  return headers;
}

async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val) url.searchParams.append(key, val);
    });
  }

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Cards ───

export async function searchCards(filters: CardFilters): Promise<ApiResponse<PokemonCard[]>> {
  const params: Record<string, string> = {};
  const qParts: string[] = [];

  if (filters.q) qParts.push(`name:${filters.q}*`);
  if (filters.supertype) qParts.push(`supertype:${filters.supertype}`);
  if (filters.types) qParts.push(`types:${filters.types}`);
  if (filters.set) qParts.push(`set.id:${filters.set}`);
  if (filters.rarity) qParts.push(`rarity:"${filters.rarity}"`);
  if (filters.hpMin || filters.hpMax) {
    const min = filters.hpMin || '*';
    const max = filters.hpMax || '*';
    qParts.push(`hp:[${min} TO ${max}]`);
  }

  if (qParts.length > 0) params.q = qParts.join(' ');
  params.page = String(filters.page || 1);
  params.pageSize = String(filters.pageSize || 20);
  if (filters.orderBy) params.orderBy = filters.orderBy;

  return fetchApi<ApiResponse<PokemonCard[]>>('/cards', params);
}

export async function getCard(id: string): Promise<PokemonCard> {
  const res = await fetchApi<{ data: PokemonCard }>(`/cards/${encodeURIComponent(id)}`);
  return res.data;
}

// ─── Sets ───

export async function getSets(): Promise<CardSet[]> {
  const res = await fetchApi<{ data: CardSet[] }>('/sets', {
    orderBy: '-releaseDate',
    pageSize: '250',
  });
  return res.data;
}

export async function getSet(id: string): Promise<CardSet> {
  const res = await fetchApi<{ data: CardSet }>(`/sets/${encodeURIComponent(id)}`);
  return res.data;
}

export async function getSetCards(
  setId: string,
  page = 1,
  pageSize = 36
): Promise<ApiResponse<PokemonCard[]>> {
  return fetchApi<ApiResponse<PokemonCard[]>>('/cards', {
    q: `set.id:${setId}`,
    page: String(page),
    pageSize: String(pageSize),
    orderBy: 'number',
  });
}

// ─── Constants ───

export const ENERGY_TYPES = [
  'Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting',
  'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water',
] as const;

export const SUPERTYPES = ['Pokémon', 'Trainer', 'Energy'] as const;

export const RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX',
  'Rare Holo GX', 'Rare Holo V', 'Rare VMAX', 'Rare Ultra',
  'Rare Rainbow', 'Rare Secret', 'Amazing Rare', 'Promo',
] as const;

/** Get the market price for a card (best available) */
export function getMarketPrice(card: PokemonCard): number | null {
  if (card.tcgplayer?.prices) {
    for (const variant of Object.values(card.tcgplayer.prices)) {
      if (variant.market) return variant.market;
      if (variant.mid) return variant.mid;
    }
  }
  if (card.cardmarket?.prices?.averageSellPrice) {
    return card.cardmarket.prices.averageSellPrice;
  }
  return null;
}
