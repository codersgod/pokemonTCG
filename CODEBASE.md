# Pokemon TCG Explorer - Codebase Documentation

## 📋 Project Summary

**Pokemon TCG Explorer** is a Next.js web application for searching, exploring, and collecting Pokémon Trading Card Game cards. It integrates with the official Pokemon TCG API to provide users with a comprehensive card database browser and personal collection manager.

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.2.9 |
| React | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Sass/SCSS | ^1.100.0 |
| Linting | ESLint | ^9 |
| Fonts | Inter (next/font) | - |

**Configuration**:
- Path alias: `@/* → ./src/*`
- Image optimization for `pokemontcg.io` and `scrydex.com`
- Strict TypeScript mode enabled

---

## 📁 Project Structure

```
pokemonTCG/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── card/[id]/         # Card detail pages (dynamic)
│   │   ├── search/            # Card search interface
│   │   ├── collection/        # User's collection view
│   │   └── sets/              # Browse card sets
│   │
│   ├── components/            # Reusable UI components
│   │   ├── BackgroundEffects/ # Animated backgrounds
│   │   ├── Button/            # Reusable button
│   │   ├── CardGrid/          # Card grid display
│   │   ├── CardItem/          # Individual card item
│   │   ├── FiltersPanel/      # Search filters
│   │   ├── HeroCarousel/      # Featured cards carousel
│   │   ├── SearchBar/         # Search input
│   │   ├── Sidebar/           # Navigation
│   │   └── TiltCard/          # 3D tilt card effect
│   │
│   ├── lib/
│   │   ├── api.ts            # Pokemon TCG API wrapper
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── hooks.ts          # Custom React hooks
│   │   ├── typeColors.ts     # Type → color mapping
│   │   └── context/
│   │       └── CollectionContext.tsx  # Global collection state
│   │
│   └── styles/
│       ├── globals.scss      # Global styles
│       └── _variables.scss   # SCSS variables
│
├── public/                    # Static assets
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint configuration
└── package.json              # Dependencies & scripts
```

---

## 🚀 Routes & Features

| Route | Purpose | Key Features |
|-------|---------|--------------|
| **`/`** | Home | Featured cards carousel, popular cards section, recent sets grid |
| **`/search`** | Search cards | Text search, advanced filters (type, supertype, rarity, HP range, set), pagination |
| **`/card/[id]`** | Card details | 3D tilt preview, market prices (TCGPlayer/CardMarket), abilities/attacks tabs, add to collection |
| **`/sets`** | Browse sets | All card sets, searchable by name/series, metadata display |
| **`/sets/[id]`** | Set details | Set hero section, all cards in set with load-more, add cards to collection |
| **`/collection`** | My collection | View collected cards, manage quantities, calculate total value |

---

## 💾 State Management

### **CollectionContext** (useReducer)
- Global collection state managing all user's cards
- Actions: `ADD_CARD`, `REMOVE_CARD`, `UPDATE_QUANTITY`, `LOAD_COLLECTION`
- Location: `src/lib/context/CollectionContext.tsx`

### **localStorage**
- Persists collection to browser storage
- Key: `'pokemon-tcg-collection'`
- Auto-syncs on collection changes

### **Page-level State** (useState)
- Search filters, pagination, loading states
- Managed per page component

---

## 🧩 Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Sidebar** | Navigation with active route indicator | `components/Sidebar/` |
| **SearchBar** | Text input with clear & search functionality | `components/SearchBar/` |
| **CardGrid** | Responsive grid of cards with loading states | `components/CardGrid/` |
| **CardItem** | Individual card with image, name, price, action buttons | `components/CardItem/` |
| **FiltersPanel** | Advanced filtering UI (type, rarity, HP, set) | `components/FiltersPanel/` |
| **HeroCarousel** | Featured cards carousel (homepage) | `components/HeroCarousel/` |
| **TiltCard** | 3D tilt effect on card hover (detail page) | `components/TiltCard/` |
| **BackgroundEffects** | Animated background with type-based glow | `components/BackgroundEffects/` |
| **Button** | Reusable button with variants | `components/Button/` |

---

## 🔌 API Layer (src/lib/api.ts)

### Main Functions

```typescript
// Search cards with filters
searchCards(filters: CardFilters): Promise<ApiResponse<PokemonCard>>

// Get single card details
getCard(id: string): Promise<PokemonCard>

// Get all card sets (sorted by release date, desc)
getSets(): Promise<CardSet[]>

// Get cards within a specific set
getSetCards(setId: string, page: number, pageSize: number): Promise<ApiResponse<PokemonCard>>
```

### Features
- Uses Pokemon TCG public API: `https://api.pokemontcg.io/v2`
- Optional API key support via `NEXT_PUBLIC_POKEMON_API_KEY` env var
- Built-in error handling with try/catch
- Type-safe responses with TypeScript interfaces

---

## 📝 Type Definitions (src/lib/types.ts)

### **PokemonCard**
```typescript
{
  id, name, supertype, subtypes, hp, types, evolvesFrom, evolvesTo,
  abilities, attacks, weaknesses, resistances, retreatCost,
  set, number, artist, rarity, flavorText,
  images: { small, large },
  tcgplayer: { prices, url },
  cardmarket: { prices, url },
  legalities: { unlimited, standard, expanded }
}
```

### **CardSet**
```typescript
{
  id, name, series, printedTotal, total, releaseDate,
  images: { symbol, logo },
  legalities, ptcgoCode
}
```

### **CollectionItem**
```typescript
{
  card: PokemonCard,
  quantity: number,
  addedAt: string
}
```

### **CardFilters**
```typescript
{
  q?: string,           // Search query
  supertype?: string,   // Card supertype
  types?: string[],     // Pokemon types
  set?: string,         // Set ID
  rarity?: string,      // Card rarity
  hpMin?: number,       // Min HP
  hpMax?: number,       // Max HP
  page?: number,        // Pagination page
  pageSize?: number,    // Items per page
  orderBy?: string      // Sort field
}
```

### **ApiResponse<T>**
```typescript
{
  data: T[],
  page: number,
  pageSize: number,
  count: number,
  totalCount: number
}
```

---

## 🎨 Styling Strategy

### **Global Styles** (`src/styles/globals.scss`)
- Base typography, layout, and CSS resets
- Integration with global variables

### **Variables** (`src/styles/_variables.scss`)
- Color palette (primary, secondary, error, warning, etc.)
- Spacing scale
- Breakpoints for responsive design
- Font definitions

### **CSS Modules**
- Each component has a `.module.scss` file
- Scoped styles prevent class name conflicts
- BEM naming convention recommended

### **Type-based Theming** (`src/lib/typeColors.ts`)
Dynamic colors based on Pokemon type:
```typescript
{
  Fire: { glow: 'rgba(...)', gradient: '...', accent: '#fb923c' },
  Water: { ... },
  Grass: { ... },
  Electric: { ... },
  // ... 11 types total
}
```
Used for backgrounds, glows, and accents on card detail pages.

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│           Pokemon TCG API (api.pokemontcg.io/v2)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
          ┌──────────────────────┐
          │   src/lib/api.ts     │
          │  (API wrapper)       │
          └────────┬─────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
   ┌─────────────┐    ┌──────────────────────┐
   │  Pages      │    │ CollectionContext    │
   │  (fetch)    │    │  (useReducer)        │
   └──────┬──────┘    └──────────┬───────────┘
          │                      │
          └──────────┬───────────┘
                     ↓
          ┌──────────────────────┐
          │    Components        │
          │  (presentation)      │
          └──────────────────────┘
                     │
                     ↓
          ┌──────────────────────┐
          │   localStorage       │
          │ (persistence layer)  │
          └──────────────────────┘
```

---

## 🏗️ Architecture Patterns

### **Container/Presentational Split**
- **Container** (pages): Fetch data, manage state, handle logic
- **Presentational** (components): Receive props, render UI

### **Client Components Strategy**
- Strategic use of `'use client'` directive for interactivity
- Server components where possible for SEO/metadata

### **Type Safety**
- Full TypeScript coverage with strict mode
- All API responses typed with interfaces
- No `any` types without justification

### **Error Handling**
- Try/catch blocks in API calls
- Graceful fallbacks for API failures
- User-friendly error messages

### **Performance Optimization**
- Image optimization via Next.js
- Lazy loading with skeleton loaders
- Pagination for large datasets
- CSS Module scoping for reduced CSS

---

## 📦 Dependencies & External APIs

### **External Services**
- **Pokemon TCG API**: https://api.pokemontcg.io/v2 (public, no auth required)
- **Image CDNs**: `pokemontcg.io`, `scrydex.com` (configured in `next.config.ts`)

### **Main npm Packages**
- `next` - React framework
- `react` - UI library
- `typescript` - Static type checking
- `sass` - CSS preprocessing
- `eslint` - Code linting

---

## 🚀 Development Commands

```bash
# Start development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

---

## 🔧 Configuration Files

### **tsconfig.json**
- Path alias: `@/* → ./src/*`
- Strict type checking enabled
- ES2020 target

### **next.config.ts**
- Remote image patterns for pokemontcg.io and scrydex.com
- Image optimization settings

### **eslint.config.mjs**
- Code quality rules
- TypeScript support

### **package.json**
- Dependencies and dev dependencies
- Scripts for dev, build, start, lint

---

## 💡 Key Takeaways for Developers

1. **Collection state is global** - Use `CollectionContext` hooks in any component
2. **All data is typed** - Check `src/lib/types.ts` for interfaces
3. **API calls are wrapped** - Use functions from `src/lib/api.ts`
4. **Component styles are scoped** - Use CSS Modules (`.module.scss`)
5. **Pokemon types have colors** - See `src/lib/typeColors.ts` for theming
6. **Data persists to localStorage** - Collection auto-syncs
7. **Images are optimized** - Handled by Next.js for pokemontcg.io domains
8. **Routes are dynamic** - Card/set IDs use Next.js dynamic routing `[id]`

---

## 🔗 Useful Links

- [Pokemon TCG API Docs](https://docs.pokemontcg.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sass Documentation](https://sass-lang.com/documentation)

---

## 📞 Quick Reference

### To add a new page:
1. Create folder in `src/app/`
2. Add `page.tsx` (server component wrapper)
3. Create client component if needed (`*Client.tsx`)
4. Use API functions from `src/lib/api.ts`
5. Add corresponding module SCSS file

### To add a new component:
1. Create folder in `src/components/`
2. Add `ComponentName.tsx` (client component with `'use client'`)
3. Add `ComponentName.module.scss`
4. Export from component folder

### To access collection:
```typescript
import { useCollection } from '@/lib/context/CollectionContext';

const { collection, addCard, removeCard, updateQuantity } = useCollection();
```

### To fetch data from API:
```typescript
import * as api from '@/lib/api';

const cards = await api.searchCards({ q: 'Pikachu' });
const card = await api.getCard(cardId);
```
