'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchCards, getSets } from '@/lib/api';
import { PokemonCard } from '@/lib/types';
import { useCollection } from '@/lib/context/CollectionContext';
import SearchBar from '@/components/SearchBar/SearchBar';
import FiltersPanel from '@/components/FiltersPanel/FiltersPanel';
import CardGrid from '@/components/CardGrid/CardGrid';
import styles from './search.module.scss';

export default function SearchPage() {
  const { addCard, removeCard, items } = useCollection();

  const [search, setSearch] = useState('');
  const [supertype, setSupertype] = useState('');
  const [energyType, setEnergyType] = useState('');
  const [rarity, setRarity] = useState('');
  const [setId, setSetId] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);

  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    getSets().then((data) => setSets(data.map((s) => ({ id: s.id, name: s.name })))).catch(() => {});
  }, []);

  const fetchCards = useCallback(
    async (q: string, p: number, append = false) => {
      setLoading(true);
      try {
        const res = await searchCards({
          q: q || undefined,
          supertype: supertype || undefined,
          types: energyType || undefined,
          rarity: rarity || undefined,
          set: setId || undefined,
          page: p,
          pageSize: 24,
          orderBy,
        });
        setCards((prev) => (append ? [...prev, ...res.data] : res.data));
        setTotalCount(res.totalCount);
        setPage(p);
      } catch {
        if (!append) setCards([]);
      } finally {
        setLoading(false);
      }
    },
    [supertype, energyType, rarity, setId, orderBy]
  );

  // Re-fetch when filters change
  useEffect(() => {
    fetchCards(search, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supertype, energyType, rarity, setId, orderBy]);

  const handleSearch = useCallback(() => {
    fetchCards(search, 1);
  }, [fetchCards, search]);

  const quantities = useMemo(
    () => Object.fromEntries(items.map((i) => [i.card.id, i.quantity])),
    [items]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search Cards</h1>
        <p className={styles.subtitle}>
          {totalCount > 0 ? `${totalCount.toLocaleString()} cards found` : 'Explore the Pokémon TCG database'}
        </p>
      </div>

      <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search by card name..." />

      <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}
      </button>

      {showFilters && (
        <FiltersPanel
          supertype={supertype} onSupertypeChange={setSupertype}
          energyType={energyType} onEnergyTypeChange={setEnergyType}
          rarity={rarity} onRarityChange={setRarity}
          setId={setId} onSetChange={setSetId}
          sets={sets}
          orderBy={orderBy} onOrderByChange={setOrderBy}
        />
      )}

      <CardGrid
        cards={cards}
        loading={loading}
        hasMore={cards.length < totalCount}
        onLoadMore={() => fetchCards(search, page + 1, true)}
        onAdd={(card) => addCard(card)}
        onRemove={(card) => removeCard(card.id)}
        quantities={quantities}
        showPrice
        emptyMessage="No cards found. Try adjusting your search or filters."
      />
    </div>
  );
}
