import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.scss';
import { CollectionProvider } from '@/lib/context/CollectionContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import styles from './layout.module.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pokémon TCG Explorer',
  description: 'Search, explore, and collect Pokémon Trading Card Game cards and sets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CollectionProvider>
          <Sidebar />
          <main className={styles.content}>{children}</main>
        </CollectionProvider>
      </body>
    </html>
  );
}
