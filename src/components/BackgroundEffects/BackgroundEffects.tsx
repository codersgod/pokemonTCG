'use client';

import { useEffect, useRef } from 'react';
import styles from './BackgroundEffects.module.scss';

interface BackgroundEffectsProps {
  glowColor?: string;
}

/**
 * Animated gradient mesh background with cursor-reactive lighting.
 * Renders subtle energy-inspired blobs and a noise texture overlay.
 */
export default function BackgroundEffects({ glowColor = 'rgba(234, 179, 8, 0.15)' }: BackgroundEffectsProps) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      el.style.setProperty('--mx', `${e.clientX}px`);
      el.style.setProperty('--my', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className={styles.bg} aria-hidden="true">
      {/* Gradient blobs */}
      <div className={styles.blob1} style={{ background: glowColor }} />
      <div className={styles.blob2} style={{ background: glowColor }} />
      <div className={styles.blob3} />

      {/* Cursor-reactive spotlight */}
      <div ref={spotlightRef} className={styles.spotlight} style={{ '--glow': glowColor } as React.CSSProperties} />

      {/* Noise overlay */}
      <div className={styles.noise} />
    </div>
  );
}
