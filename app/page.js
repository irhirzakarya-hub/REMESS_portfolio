import { getConfig } from '@/lib/storage';
import CardClient from './CardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const initialData = await getConfig();
  return <CardClient initialData={initialData} />;
}
