import type { Metadata } from 'next';
import { QuizPageView } from '@/features/learn/quiz-page';
export const metadata: Metadata = { title: 'Quiz' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizPageView id={id} />;
}
