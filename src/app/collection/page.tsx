'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection } from '@/lib/context/CollectionContext';
import { getMarketPrice } from '@/lib/api';
import Button from '@/components/Button/Button';
import styles from './collection.module.scss';

export default function CollectionPage() {
  const { items, removeCard, updateQuantity, totalValue, totalCards } = useCollection();

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.card.name.localeCompare(b.card.name)),
    [items]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Collection</h1>
          <p className={styles.subtitle}>{totalCards} cards collected</p>
        </div>
        {items.length > 0 && (
          <div className={styles.valueCard}>
            <span className={styles.valueLabel}>Total Value</span>
            <span className={styles.valueAmount}>${totalValue.toFixed(2)}</span>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No cards yet</h2>
          <p className={styles.emptyText}>
            Start exploring and add cards to your collection.
          </p>
          <Link href="/search">
            <Button variant="primary">Search Cards</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedItems.map((item) => {
            const price = getMarketPrice(item.card);
            return (
              <div key={item.card.id} className={styles.card}>
                <Link href={`/card/${item.card.id}`} className={styles.imageLink}>
                  <Image
                    src={item.card.images.small}
                    alt={item.card.name}
                    width={120}
                    height={167}
                    className={styles.image}
                  />
                </Link>
                <div className={styles.info}>
                  <Link href={`/card/${item.card.id}`} className={styles.name}>
                    {item.card.name}
                  </Link>
                  <p className={styles.meta}>
                    {item.card.set.name} · {item.card.rarity || item.card.supertype}
                  </p>
                  {price !== null && (
                    <p className={styles.price}>
                      ${price.toFixed(2)} each · <strong>${(price * item.quantity).toFixed(2)}</strong> total
                    </p>
                  )}
                  <div className={styles.qtyRow}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.card.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.card.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeCard(item.card.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
