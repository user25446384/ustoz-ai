import type { Metadata } from 'next';
import { QuizResultPage } from '@/features/learn/quiz-result-page';
export const metadata: Metadata = { title: 'Quiz natijasi' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizResultPage id={id} />;
}
