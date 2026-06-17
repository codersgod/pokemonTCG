# TODO

## PricingAnalytics Hook Order Fix
- [ ] Refactor `src/components/PricingAnalytics/PricingAnalytics.tsx` to guarantee Hooks are called in the same order on every render.
  - [ ] Remove hook-number changes caused by early returns in `loading` / `error` paths.
  - [ ] Keep all `useMemo` / `useState` hooks unconditional by moving conditional UI into variables returned in the final JSX.
  - [ ] Ensure any state that isn't used in computations doesn't introduce new hook paths.
- [ ] Run Next.js dev build/lint to confirm the error is gone.

