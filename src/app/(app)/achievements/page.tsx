import type { Metadata } from 'next';
import { AchievementsView } from '@/features/learn/progress/achievements-view';
export const metadata: Metadata = { title: 'Yutuqlar' };
export default function Page() { return <AchievementsView />; }
