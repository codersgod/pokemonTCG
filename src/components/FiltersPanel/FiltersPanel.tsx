'use client';

import { ENERGY_TYPES, SUPERTYPES, RARITIES } from '@/lib/api';
import styles from './FiltersPanel.module.scss';

interface FiltersPanelProps {
  supertype: string;
  onSupertypeChange: (v: string) => void;
  energyType: string;
  onEnergyTypeChange: (v: string) => void;
  rarity: string;
  onRarityChange: (v: string) => void;
  setId: string;
  onSetChange: (v: string) => void;
  sets: { id: string; name: string }[];
  orderBy: string;
  onOrderByChange: (v: string) => void;
}

export default function FiltersPanel({
  supertype, onSupertypeChange,
  energyType, onEnergyTypeChange,
  rarity, onRarityChange,
  setId, onSetChange,
  sets,
  orderBy, onOrderByChange,
}: FiltersPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.group}>
        <label className={styles.label}>Card Type</label>
        <select className={styles.select} value={supertype} onChange={(e) => onSupertypeChange(e.target.value)}>
          <option value="">All Types</option>
          {SUPERTYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Energy Type</label>
        <select className={styles.select} value={energyType} onChange={(e) => onEnergyTypeChange(e.target.value)}>
          <option value="">All Energy</option>
          {ENERGY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Rarity</label>
        <select className={styles.select} value={rarity} onChange={(e) => onRarityChange(e.target.value)}>
          <option value="">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Set</label>
        <select className={styles.select} value={setId} onChange={(e) => onSetChange(e.target.value)}>
          <option value="">All Sets</option>
          {sets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Sort By</label>
        <select className={styles.select} value={orderBy} onChange={(e) => onOrderByChange(e.target.value)}>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="-set.releaseDate">Newest</option>
          <option value="set.releaseDate">Oldest</option>
          <option value="nationalPokedexNumbers">Pokédex #</option>
        </select>
      </div>
    </div>
  );
}
