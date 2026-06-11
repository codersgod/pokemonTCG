import CardDetailClient from './CardDetailClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function CardDetailPage() {
  return <CardDetailClient />;
}
