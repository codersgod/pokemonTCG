import SetDetailClient from './SetDetailClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function SetDetailPage() {
  return <SetDetailClient />;
}
