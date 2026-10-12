import type { Metadata } from 'next';
import { LessonView } from '@/features/learn/lesson/lesson-view';
export const metadata: Metadata = { title: 'Dars' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonView id={id} />;
}
