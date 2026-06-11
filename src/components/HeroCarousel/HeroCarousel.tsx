'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PokemonCard, CardSet } from '@/lib/types';
import styles from './HeroCarousel.module.scss';

type HeroItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

interface HeroCarouselProps {
  items: HeroItem[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <div className={styles.carousel}>
      <div className={styles.slide} key={item.id}>
        <div className={styles.imageWrapper}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className={styles.image}
            priority
          />
          <div className={styles.gradient} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{item.title}</h2>
          <p className={styles.subtitle}>{item.subtitle}</p>
          <Link href={item.href} className={styles.cta}>
            View Details →
          </Link>
        </div>
      </div>

      {items.length > 1 && (
        <div className={styles.dots}>
          {items.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Helper to create hero items from cards */
export function cardsToHeroItems(cards: PokemonCard[]): HeroItem[] {
  return cards.map((c) => ({
    id: c.id,
    title: c.name,
    subtitle: `${c.supertype} · ${c.set.name}${c.hp ? ` · ${c.hp} HP` : ''}`,
    image: c.images.small,
    href: `/card/${c.id}`,
  }));
}

/** Helper to create hero items from sets */
export function setsToHeroItems(sets: CardSet[]): HeroItem[] {
  return sets.map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: `${s.series} · ${s.total} cards · ${s.releaseDate}`,
    image: s.images.logo,
    href: `/sets/${s.id}`,
  }));
}
