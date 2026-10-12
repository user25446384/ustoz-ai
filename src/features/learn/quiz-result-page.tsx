'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizResultView } from '@/features/quiz/quiz-result';
import type { InProgressAttempt, QuizResult } from '@/features/quiz/types';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

export function QuizResultPage({ id }: { id: string }) {
  const { t, te } = useT();
  const router = useRouter();
  const q = useQuery({
    queryKey: ['quiz-attempt', id], staleTime: 60_000,
    queryFn: ({ signal }) => api.get<InProgressAttempt | QuizResult>(`/quiz-attempts/${encodeURIComponent(id)}`, { signal }),
  });
  const inProgressQuizId = q.data?.status === 'IN_PROGRESS' ? q.data.quiz.id : null;
  useEffect(() => { if (inProgressQuizId) router.replace(`/quizzes/${inProgressQuizId}`); }, [inProgressQuizId, router]);

  if (q.isError) return <ErrorState message={errorText(q.error, te)} onRetry={() => void q.refetch()} />;
  if (q.isPending || q.data.status === 'IN_PROGRESS') return <div className="space-y-4" aria-busy="true"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;

  const r = q.data;
  const topicSlug = r.topics.find((x) => x.slug)?.slug;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">{r.attempt.quizTitle}</h1>
      <QuizResultView
        result={r}
        actions={
          <>
            <Button asChild size="lg"><Link href={`/quizzes/${r.attempt.quizId}`}>{t('quizResultPage.retry')}</Link></Button>
            {topicSlug && <Button asChild size="lg" variant="outline"><Link href={`/topics/${topicSlug}`}>{t('quizResultPage.toTopic')}</Link></Button>}
            <Button asChild size="lg" variant="ghost"><Link href="/dashboard">{t('quizResultPage.toDashboard')}</Link></Button>
          </>
        }
      />
    </div>
  );
}
