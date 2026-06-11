'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> ) },
  { href: '/search', label: 'Search', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> ) },
  { href: '/sets', label: 'Sets', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> ) },
  { href: '/collection', label: 'Collection', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ) },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <line x1="2" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <span className={styles.logoText}>TCG</span>
      </Link>

      {/* Navigation */}
      <ul className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <li key={item.href} className={styles.navLi}>
              <Link href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {isActive && <span className={styles.indicator} />}
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.tooltip}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.footer}>
        <div className={styles.footerDot} />
      </div>
    </nav>
  );
}
