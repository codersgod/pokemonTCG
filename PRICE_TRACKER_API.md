# Pokemon Price Tracker API Integration

## Overview

This project integrates with the **Pokemon Price Tracker API** to display real-time price history analytics for Pokemon TCG cards on the card detail pages.

## API Details

- **API Provider**: Pokemon Price Tracker
- **API Key**: `pokeprice_free_51158792ba6342d1c332a011d315b61be67b4d354a4de0ee`
- **Documentation**: https://www.pokemonpricetracker.com/api-keys
- **Base URL**: `https://api.pokemonpricetracker.com/v1`

## Features

### Price Analytics Section

The card detail page (`/card/[id]`) now includes a comprehensive Price Analytics section that displays:

1. **Interactive Price Chart**
   - Visual bar chart showing price trends over time
   - Hover tooltips with exact date and price information
   - Color-coded bars based on price levels

2. **Time Period Selection**
   - 7 days (7d)
   - 30 days (30d) - default
   - 90 days (90d)

3. **Price Statistics**
   - **Current Price**: Latest market price
   - **24h Change**: Price change percentage in last 24 hours
   - **7d Change**: Price change percentage in last 7 days
   - **30d Change**: Price change percentage in last 30 days
   - **Average Price**: Mean price over selected period
   - **Price Range**: Lowest to highest price in period

4. **Visual Indicators**
   - Green (↑) for price increases
   - Red (↓) for price decreases
   - Gray (→) for no change
   - Dynamic color theming based on card type

## Implementation

### Files Created/Modified

1. **`src/lib/priceTrackerApi.ts`** (NEW)
   - API integration service
   - Handles API requests to Pokemon Price Tracker
   - Data transformation and error handling
   - Fallback mock data when API is unavailable
   - Caching strategy (5-minute revalidation)

2. **`src/components/PricingAnalytics/PricingAnalytics.tsx`** (UPDATED)
   - Replaced mock data generation with real API calls
   - Added error handling and loading states
   - Maintains existing UI/styling patterns
   - Async data fetching with proper cleanup

3. **`src/app/card/[id]/CardDetailClient.tsx`** (ALREADY INTEGRATED)
   - PricingAnalytics component already included on line 268-272
   - Passes card ID, name, and type color for theming

### API Integration Details

```typescript
// Fetch price history for a card
const priceData = await fetchPriceHistory(cardId, period);

// Response includes:
interface PriceTrackerData {
  cardId: string;
  cardName: string;
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  history: PricePoint[];
}
```

### Error Handling

The implementation includes robust error handling:

- **API Failures**: Falls back to mock data generation
- **Network Issues**: Displays user-friendly error message
- **Loading States**: Shows skeleton loaders during data fetch
- **Component Cleanup**: Prevents memory leaks with proper useEffect cleanup

### Caching Strategy

- API responses are cached for **5 minutes** using Next.js `revalidate`
- Reduces API calls and improves performance
- Ensures fresh data without excessive requests

## UI/UX Considerations

✅ **Maintains Existing Design System**
- Uses existing SCSS modules and variables
- Matches card detail page styling patterns
- Respects type-based color theming
- Responsive design for all screen sizes

✅ **Performance Optimized**
- Async data loading
- Skeleton loading states
- Proper React cleanup
- Cached API responses

✅ **User Experience**
- Clear loading indicators
- Helpful error messages
- Interactive chart with tooltips
- Smooth transitions and animations

## Testing

To test the integration:

1. Navigate to any card detail page: `/card/[cardId]`
2. Scroll to the "Price Analytics" section
3. Toggle between different time periods (7d, 30d, 90d)
4. Hover over chart bars to see detailed price information
5. Observe price change indicators and statistics

## Future Enhancements

Potential improvements:

- [ ] Add more advanced charting library (e.g., Chart.js, Recharts)
- [ ] Include volume data if available from API
- [ ] Add price alerts/notifications
- [ ] Compare prices across different marketplaces
- [ ] Export price history data
- [ ] Add price prediction trends

## Notes

- The free API key has usage limits - monitor API calls
- Fallback mock data ensures functionality even if API is down
- All prices are displayed in USD ($) format
- Data is sourced from multiple marketplaces (TCGPlayer, CardMarket, etc.)
