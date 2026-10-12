import type { Metadata } from 'next';
import { LearnView } from '@/features/learn/learn-view';
export const metadata: Metadata = { title: 'O‘rganish' };
export default function Page() { return <LearnView />; }
