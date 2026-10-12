'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { ErrorState } from '@/components/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopicProgress } from '@/features/dashboard/types';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BandBadge } from './band-badge';
import { percentOf } from './helpers';
import { useTopicLessons, useTopicQuizzes } from './queries';
import type { TopicDetail } from './types';

export function TopicView({ slug }: { slug: string }) {
  const { t, te } = useT();
  const { data: me } = useMe();
  const isStudent = me?.role === 'STUDENT';

  const topic = useQuery({ queryKey: ['topic', slug], queryFn: ({ signal }) => api.get<TopicDetail>(`/topics/${encodeURIComponent(slug)}`, { signal }) });
  const lessons = useTopicLessons(topic.data?.id);
  const quizzes = useTopicQuizzes(topic.data?.id);
  const subjectId = topic.data?.subject.id;
  const progress = useQuery({
    queryKey: ['progress', 'topics', 'subject', subjectId], enabled: isStudent && !!subjectId,
    queryFn: ({ signal }) => api.getPage<TopicProgress>('/progress/topics', { params: { subjectId, limit: 100 }, signal }),
  });

  if (topic.isError) return <ErrorState message={errorText(topic.error, te)} onRetry={() => void topic.refetch()} />;
  if (topic.isPending) return <div className="space-y-4" aria-busy="true"><Skeleton className="h-10 w-72" /><Skeleton className="h-64 w-full" /></div>;

  const tp = topic.data;
  const mine = progress.data?.items.find((p) => p.topicId === tp.id);
  const list = lessons.data?.items ?? [];
  const done = list.filter((l) => l.completed).length;
  const crumbs = [
    { label: t('subjects.title'), href: '/subjects' },
    { label: tp.subject.name, href: `/subjects/${tp.subject.slug}` },
    ...(tp.parent ? [{ label: tp.parent.title, href: `/topics/${tp.parent.slug}` }] : []),
    { label: tp.title },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={crumbs} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{tp.title}</h1>
          {tp.description && <p className="text-sm text-muted-foreground">{tp.description}</p>}
        </div>
        {mine && (
          <div className="flex items-center gap-2 text-sm"><BandBadge band={mine.band} />{mine.assessed && <span className="text-muted-foreground">{t('topic.mastery', { value: Math.round(mine.mastery) })}</span>}</div>
        )}
      </header>

      {tp.children.length > 0 && (
        <section aria-labelledby="sub-h" className="space-y-3">
          <h2 id="sub-h" className="text-lg font-semibold">{t('topic.subtopics')}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {tp.children.map((c) => (
              <li key={c.id}>
                <Link href={`/topics/${c.slug}`} className="block h-full rounded-xl border bg-card p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <p className="font-medium">{c.title}</p>{c.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="lessons-h" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="lessons-h" className="text-lg font-semibold">{t('topic.lessons')}</h2>
          {isStudent && list.length > 0 && <span className="text-sm text-muted-foreground">{t('topic.lessonsDone', { done, total: list.length })}</span>}
        </div>
        {isStudent && list.length > 0 && (
          <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percentOf(done, list.length)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${percentOf(done, list.length)}%` }} />
          </div>
        )}
        {lessons.isPending ? <Skeleton className="h-40 w-full" /> : lessons.isError ? (
          <ErrorState message={errorText(lessons.error, te)} onRetry={() => void lessons.refetch()} />
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('topic.noLessons')}</p>
        ) : (
          <ol className="space-y-2">
            {list.map((l, i) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.id}`} className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {l.completed ? <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden /> : <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden />}
                  <span className="sr-only">{l.completed ? t('lesson.completed') : ''}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium"><span className="text-muted-foreground">{i + 1}. </span>{l.title}</span>
                    {l.description && <span className="line-clamp-1 text-xs text-muted-foreground">{l.description}</span>}
                  </span>
                  {!l.isPublished && <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{t('topic.draft')}</span>}
                  <DifficultyBadge value={l.difficulty} className="hidden sm:inline-flex" />
                  <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex"><Clock className="size-3.5" aria-hidden />{t('topic.minutes', { count: l.estimatedMinutes })}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="quizzes-h" className="space-y-3">
        <h2 id="quizzes-h" className="text-lg font-semibold">{t('topic.quizzes')}</h2>
        {quizzes.isPending ? <Skeleton className="h-20 w-full" /> : (quizzes.data?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">{t('topic.noQuizzes')}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {quizzes.data!.items.map((q) => (
              <li key={q.id}>
                <Link href={`/quizzes/${q.id}`} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className={cn('h-full transition-colors hover:bg-accent')}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary" aria-hidden><ListChecks className="size-5" /></span>
                      <span className="min-w-0"><span className="block truncate font-medium">{q.title}</span><span className="text-xs text-muted-foreground">{t('topic.questions', { count: q._count.questions })}{q.duration ? ` · ${t('topic.minutes', { count: q.duration })}` : ''}</span></span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
