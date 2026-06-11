'use client';

import { PokemonCard } from '@/lib/types';
import CardItem, { CardItemSkeleton } from '../CardItem/CardItem';
import Button from '../Button/Button';
import styles from './CardGrid.module.scss';

interface CardGridProps {
  cards: PokemonCard[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAdd?: (card: PokemonCard) => void;
  onRemove?: (card: PokemonCard) => void;
  quantities?: Record<string, number>;
  showPrice?: boolean;
  emptyMessage?: string;
}

export default function CardGrid({
  cards, loading, hasMore, onLoadMore, onAdd, onRemove, quantities, showPrice, emptyMessage,
}: CardGridProps) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          quantity={quantities?.[card.id]}
          showPrice={showPrice}
          onAdd={onAdd ? () => onAdd(card) : undefined}
          onRemove={onRemove && quantities?.[card.id] ? () => onRemove(card) : undefined}
        />
      ))}

      {loading && Array.from({ length: 8 }).map((_, i) => <CardItemSkeleton key={`s${i}`} />)}

      {!loading && cards.length === 0 && (
        <div className={styles.empty}>{emptyMessage || 'No cards found.'}</div>
      )}

      {hasMore && !loading && (
        <div className={styles.loadMore}>
          <Button variant="secondary" onClick={onLoadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
}
