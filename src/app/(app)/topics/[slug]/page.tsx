import type { Metadata } from 'next';
import { TopicView } from '@/features/learn/topic-view';
export const metadata: Metadata = { title: 'Mavzu' };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TopicView slug={slug} />;
}
