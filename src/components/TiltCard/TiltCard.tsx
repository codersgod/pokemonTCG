'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './TiltCard.module.scss';

interface TiltCardProps {
  src: string;
  alt: string;
  glowColor: string;
}

/**
 * Premium 3D-tilt card with glow aura, shimmer reflection, and floating animation.
 * Reacts to cursor position for realistic perspective shift.
 */
export default function TiltCard({ src, alt, glowColor }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    const shim = shimmerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Tilt: max ±15deg
    const rotateY = (x - 0.5) * 30;
    const rotateX = (0.5 - y) * 30;

    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

    // Shimmer light follows cursor
    if (shim) {
      shim.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.25) 0%, transparent 60%)`;
    }
  }, []);

  const handleLeave = useCallback(() => {
    const el = cardRef.current;
    const shim = shimmerRef.current;
    if (el) el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    if (shim) shim.style.background = 'transparent';
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Glow aura behind card */}
      <div className={styles.glow} style={{ boxShadow: `0 0 80px 30px ${glowColor}, 0 0 160px 60px ${glowColor}` }} />

      <div
        ref={cardRef}
        className={styles.card}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <Image
          src={src}
          alt={alt}
          width={320}
          height={447}
          className={styles.image}
          priority
        />

        {/* Shimmer overlay */}
        <div ref={shimmerRef} className={styles.shimmer} />
      </div>
    </div>
  );
}
