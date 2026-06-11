// ─── Pokémon TCG Card Types ───

export interface PokemonCard {
  id: string;
  name: string;
  supertype: 'Pokémon' | 'Trainer' | 'Energy';
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: TypeValue[];
  resistances?: TypeValue[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: CardSet;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Legalities;
  images: CardImages;
  tcgplayer?: TCGPlayer;
  cardmarket?: CardMarket;
}

export interface Ability {
  name: string;
  text: string;
  type: string;
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface TypeValue {
  type: string;
  value: string;
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities?: Legalities;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: SetImages;
}

export interface SetImages {
  symbol: string;
  logo: string;
}

export interface Legalities {
  unlimited?: string;
  standard?: string;
  expanded?: string;
}

export interface CardImages {
  small: string;
  large: string;
}

export interface TCGPlayer {
  url: string;
  updatedAt: string;
  prices?: Record<string, {
    low?: number;
    mid?: number;
    high?: number;
    market?: number;
    directLow?: number;
  }>;
}

export interface CardMarket {
  url: string;
  updatedAt: string;
  prices?: Record<string, number>;
}

// ─── API Response ───

export interface ApiResponse<T> {
  data: T;
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// ─── Collection ───

export interface CollectionItem {
  card: PokemonCard;
  quantity: number;
  addedAt: string;
}

// ─── Filters ───

export interface CardFilters {
  q?: string;
  supertype?: string;
  types?: string;
  set?: string;
  rarity?: string;
  hpMin?: string;
  hpMax?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}
