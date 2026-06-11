'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSets } from '@/lib/api';
import { CardSet } from '@/lib/types';
import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './sets.module.scss';

export default function SetsPage() {
  const [sets, setSets] = useState<CardSet[]>([]);
  const [filtered, setFiltered] = useState<CardSet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSets()
      .then((data) => { setSets(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(sets);
    } else {
      const q = search.toLowerCase();
      setFiltered(sets.filter((s) => s.name.toLowerCase().includes(q) || s.series.toLowerCase().includes(q)));
    }
  }, [search, sets]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Card Sets</h1>
        <p className={styles.subtitle}>{sets.length} sets available</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search sets..." />

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <div key={i} className={styles.skeleton} />)
          : filtered.map((set) => (
              <Link key={set.id} href={`/sets/${set.id}`} className={styles.card}>
                <div className={styles.logoWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={set.images.logo} alt={set.name} className={styles.logo} />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{set.name}</h3>
                  <p className={styles.series}>{set.series}</p>
                  <div className={styles.meta}>
                    <span>{set.total} cards</span>
                    <span>{set.releaseDate}</span>
                  </div>
                </div>
              </Link>
            ))
        }
      </div>

      {!loading && filtered.length === 0 && (
        <p className={styles.empty}>No sets match your search.</p>
      )}
    </div>
  );
}
