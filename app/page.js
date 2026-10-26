import { getConfig } from '@/lib/storage';
import CardClient from './CardClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialData = await getConfig();
  return <CardClient initialData={initialData} />;
}
