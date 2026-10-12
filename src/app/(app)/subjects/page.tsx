import type { Metadata } from 'next';
import { SubjectsListView } from '@/features/learn/subjects-list-view';
export const metadata: Metadata = { title: 'Fanlar' };
export default function Page() { return <SubjectsListView />; }
