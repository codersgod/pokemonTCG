'use client';

import styles from './SearchBar.module.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search cards...' }: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) onSearch();
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button className={styles.clear} onClick={() => { onChange(''); if (onSearch) onSearch(); }} aria-label="Clear search">
          ✕
        </button>
      )}
      {onSearch && (
        <button className={styles.searchBtn} onClick={onSearch} aria-label="Search">
          Search
        </button>
      )}
    </div>
  );
}
