'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { searchCards, getSets } from '@/lib/api';
import { PokemonCard, CardSet } from '@/lib/types';
import HeroCarousel, { cardsToHeroItems } from '@/components/HeroCarousel/HeroCarousel';
import CardGrid from '@/components/CardGrid/CardGrid';
import Button from '@/components/Button/Button';
import styles from './page.module.scss';

export default function HomePage() {
  const [featuredCards, setFeaturedCards] = useState<PokemonCard[]>([]);
  const [popularCards, setPopularCards] = useState<PokemonCard[]>([]);
  const [recentSets, setRecentSets] = useState<CardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredRes, popularRes, setsData] = await Promise.all([
          // Featured: high-rarity cards
          searchCards({ rarity: 'Rare Holo V', pageSize: 5, page: 1 }),
          // Popular: well-known Pokémon
          searchCards({ q: 'charizard', pageSize: 8, page: 1, orderBy: '-set.releaseDate' }),
          getSets(),
        ]);
        setFeaturedCards(featuredRes.data);
        setPopularCards(popularRes.data);
        setRecentSets(setsData.slice(0, 6));
      } catch {
        // Silently handle; sections will be empty
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Carousel */}
      <HeroCarousel items={cardsToHeroItems(featuredCards)} />

      {/* Quick Navigation */}
      <section className={styles.quickNav}>
        <Link href="/search" className={styles.quickCard}>
          <span className={styles.quickIcon}>🔍</span>
          <span className={styles.quickLabel}>Search Cards</span>
        </Link>
        <Link href="/sets" className={styles.quickCard}>
          <span className={styles.quickIcon}>📦</span>
          <span className={styles.quickLabel}>Browse Sets</span>
        </Link>
        <Link href="/collection" className={styles.quickCard}>
          <span className={styles.quickIcon}>⭐</span>
          <span className={styles.quickLabel}>My Collection</span>
        </Link>
        <Link href="/search?supertype=Pokémon" className={styles.quickCard}>
          <span className={styles.quickIcon}>⚡</span>
          <span className={styles.quickLabel}>Pokémon Cards</span>
        </Link>
      </section>

      {/* Popular Cards */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Popular Cards</h2>
          <Link href="/search">
            <Button variant="ghost" size="small">View All →</Button>
          </Link>
        </div>
        <CardGrid cards={popularCards} loading={loading} showPrice />
      </section>

      {/* Recent Sets */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Sets</h2>
          <Link href="/sets">
            <Button variant="ghost" size="small">View All →</Button>
          </Link>
        </div>
        <div className={styles.setsGrid}>
          {recentSets.map((set) => (
            <Link key={set.id} href={`/sets/${set.id}`} className={styles.setCard}>
              <div className={styles.setLogo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={set.images.logo} alt={set.name} className={styles.setLogoImg} />
              </div>
              <div className={styles.setInfo}>
                <h3 className={styles.setName}>{set.name}</h3>
                <p className={styles.setMeta}>{set.total} cards · {set.releaseDate}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section className={styles.about}>
        <h2 className={styles.aboutTitle}>Pokémon TCG Explorer</h2>
        <p className={styles.aboutText}>
          Search through thousands of Pokémon Trading Card Game cards, explore sets,
          track market prices, and build your personal collection. Powered by the PokémonTCG API.
        </p>
      </section>
    </div>
  );
}
