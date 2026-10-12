'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { ErrorState } from '@/components/error-state';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizRunner } from '@/features/quiz/quiz-runner';
import type { InProgressAttempt } from '@/features/quiz/types';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';
import { ReportButton } from './lesson/report-button';
import type { AttemptListItem, QuizMeta } from './types';

export function QuizPageView({ id }: { id: string }) {
  const { t, te } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const isStudent = me?.role === 'STUDENT';
  const [attempt, setAttempt] = useState<InProgressAttempt | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const quiz = useQuery({ queryKey: ['quiz', id], queryFn: ({ signal }) => api.get<QuizMeta>(`/quizzes/${encodeURIComponent(id)}`, { signal }) });
  const history = useQuery({
    queryKey: ['quiz-attempts', 'quiz', id], enabled: isStudent,
    queryFn: ({ signal }) => api.getPage<AttemptListItem>('/quiz-attempts', { params: { quizId: id, limit: 5 }, signal }),
  });
  const start = useMutation({
    mutationFn: () => api.post<InProgressAttempt>('/quiz-attempts', { quizId: id }),
    onSuccess: (a) => { setStartError(null); setAttempt(a); },
    onError: (e) => setStartError(errorText(e, te)),
  });

  if (attempt) {
    return (
      <QuizRunner
        attempt={attempt}
        onSubmitted={(r) => {
          qc.setQueryData(['quiz-attempt', r.attempt.id], r);
          for (const k of ['progress', 'quiz-attempts', 'achievements', 'recommendations', 'roadmap']) void qc.invalidateQueries({ queryKey: [k] });
          router.replace(`/quiz/${r.attempt.id}/result`);
        }}
      />
    );
  }

  if (quiz.isError) return <ErrorState message={errorText(quiz.error, te)} onRetry={() => void quiz.refetch()} />;
  if (quiz.isPending) return <div className="space-y-4" aria-busy="true"><Skeleton className="h-6 w-72" /><Skeleton className="h-48 w-full" /></div>;

  const q = quiz.data;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[
        { label: t('subjects.title'), href: '/subjects' },
        { label: q.topic.subject.name, href: `/subjects/${q.topic.subject.slug}` },
        { label: q.topic.title, href: `/topics/${q.topic.slug}` },
        { label: q.title },
      ]} />

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              {q.isDiagnostic && <span className="inline-flex rounded-md bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">{t('quizPage.diagnostic')}</span>}
              <h1 className="text-2xl font-bold tracking-tight">{q.title}</h1>
              {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
            </div>
            {me && me.role !== 'ADMIN' && <ReportButton targetType="QUIZ" targetId={q.id} />}
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5"><HelpCircle className="size-4" aria-hidden />{t('quizPage.questions', { count: q.questionCount })}</li>
            <li className="flex items-center gap-1.5"><Clock className="size-4" aria-hidden />{q.duration ? t('quizPage.duration', { count: q.duration }) : t('quizPage.noLimit')}</li>
            <li><DifficultyBadge value={q.difficulty} /></li>
          </ul>

          {!q.isPublished && <Alert>{t('quizPage.draft')}</Alert>}
          {q.duration && <Alert>{t('quizPage.timerNote')}</Alert>}
          {startError && <Alert variant="destructive">{startError}</Alert>}

          {isStudent ? (
            <Button size="lg" loading={start.isPending} disabled={!q.isPublished || q.questionCount === 0} onClick={() => start.mutate()}>{t('quizPage.start')}</Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t('quizPage.studentOnly')}</p>
          )}
        </CardContent>
      </Card>

      {isStudent && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('quizPage.history')}</CardTitle></CardHeader>
          <CardContent>
            {history.isPending ? <Skeleton className="h-16 w-full" /> : (history.data?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">{t('quizPage.noHistory')}</p>
            ) : (
              <ul className="divide-y">
                {history.data!.items.map((a) => (
                  <li key={a.id}>
                    <Link href={`/quiz/${a.id}/result`} className="flex items-center justify-between gap-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="text-muted-foreground">{a.completedAt ? formatDateTime(a.completedAt) : '—'}</span>
                      <span className="flex items-center gap-3"><span className="tabular-nums text-muted-foreground">{a.score} / {a.maxScore}</span><span className="rounded-md bg-muted px-2 py-0.5 font-semibold tabular-nums">{Math.round(a.percentage)}%</span><span className="text-primary-strong">{t('quizPage.viewResult')}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
