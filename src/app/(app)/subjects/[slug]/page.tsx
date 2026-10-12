import type { Metadata } from 'next';
import { SubjectView } from '@/features/learn/subject-view';
export const metadata: Metadata = { title: 'Fan' };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SubjectView slug={slug} />;
}
