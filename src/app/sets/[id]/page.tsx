'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSet, getSetCards } from '@/lib/api';
import { CardSet, PokemonCard } from '@/lib/types';
import { useCollection } from '@/lib/context/CollectionContext';
import CardGrid from '@/components/CardGrid/CardGrid';
import styles from './setDetail.module.scss';

export default function SetDetailPage() {
  const params = useParams<{ id: string }>();
  const { addCard, removeCard, items } = useCollection();

  const [set, setSet] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    Promise.all([getSet(params.id), getSetCards(params.id, 1, 36)])
      .then(([setData, cardsRes]) => {
        setSet(setData);
        setCards(cardsRes.data);
        setTotalCount(cardsRes.totalCount);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const loadMore = async () => {
    if (!params.id) return;
    const nextPage = page + 1;
    const res = await getSetCards(params.id, nextPage, 36);
    setCards((prev) => [...prev, ...res.data]);
    setPage(nextPage);
  };

  const quantities = useMemo(
    () => Object.fromEntries(items.map((i) => [i.card.id, i.quantity])),
    [items]
  );

  if (loading && !set) {
    return <div className={styles.loading}>Loading set...</div>;
  }

  if (!set) {
    return (
      <div className={styles.error}>
        <h2>Set not found</h2>
        <Link href="/sets" className={styles.backLink}>← Back to Sets</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/sets" className={styles.backLink}>← Back to Sets</Link>

      <div className={styles.hero}>
        <div className={styles.heroLogo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={set.images.logo} alt={set.name} className={styles.logoImg} />
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.title}>{set.name}</h1>
          <p className={styles.series}>{set.series}</p>
          <div className={styles.meta}>
            <span>{set.total} cards</span>
            <span>Released {set.releaseDate}</span>
            {set.ptcgoCode && <span>PTCGO: {set.ptcgoCode}</span>}
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>
        All Cards <span className={styles.sectionCount}>({totalCount})</span>
      </h2>

      <CardGrid
        cards={cards}
        loading={loading}
        hasMore={cards.length < totalCount}
        onLoadMore={loadMore}
        onAdd={(card) => addCard(card)}
        onRemove={(card) => removeCard(card.id)}
        quantities={quantities}
        showPrice
      />
    </div>
  );
}
