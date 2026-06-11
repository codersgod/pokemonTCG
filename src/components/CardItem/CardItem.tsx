'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PokemonCard as CardType } from '@/lib/types';
import { getMarketPrice } from '@/lib/api';
import styles from './CardItem.module.scss';

interface CardItemProps {
  card: CardType;
  quantity?: number;
  showPrice?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
}

export default function CardItem({ card, quantity, showPrice, onAdd, onRemove }: CardItemProps) {
  const price = showPrice ? getMarketPrice(card) : null;

  return (
    <Link href={`/card/${card.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={card.images.small}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          className={styles.image}
        />
      </div>

      {quantity !== undefined && quantity > 0 && (
        <span className={styles.badge}>×{quantity}</span>
      )}

      {/* Always-visible info overlay at bottom of card image */}
      <div className={styles.infoBar}>
        <p className={styles.infoName}>{card.name}</p>
        <p className={styles.infoMeta}>
          {card.supertype}{card.hp ? ` · ${card.hp} HP` : ''}
        </p>
        {price !== null && (
          <p className={styles.infoPrice}>${price.toFixed(2)}</p>
        )}
      </div>

      <div className={styles.overlay}>
        {(onAdd || onRemove) && (
          <div className={styles.actions}>
            {onAdd && (
              <button className={styles.addBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(); }}>
                + Collect
              </button>
            )}
            {onRemove && (
              <button className={styles.removeBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}>
                − Remove
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function CardItemSkeleton() {
  return <div className={styles.skeleton} />;
}
