'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { recommendationHref } from '@/features/dashboard/helpers';
import { NextLessonCard } from '@/features/dashboard/study-cards';
import type { Overview, SubjectSummary } from '@/features/dashboard/types';
import { api } from '@/lib/api/client';
import { homePath } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { percentOf } from './helpers';
import { SubjectTile } from './subject-tile';

export function LearnView() {
  const { t, te } = useT();
  const router = useRouter();
  const { data: me } = useMe();
  useEffect(() => { if (me && me.role !== 'STUDENT') router.replace(homePath(me)); }, [me, router]);
  const enabled = me?.role === 'STUDENT';

  const overview = useQuery({ queryKey: ['progress', 'overview'], enabled, queryFn: ({ signal }) => api.get<Overview>('/progress/overview', { signal }) });
  const subjects = useQuery({ queryKey: ['progress', 'subjects'], enabled, queryFn: ({ signal }) => api.get<SubjectSummary[]>('/progress/subjects', { signal }) });

  if (subjects.isError) return <ErrorState message={errorText(subjects.error, te)} onRetry={() => void subjects.refetch()} />;
  const recs = overview.data?.recommendations ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('learn.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('learn.subtitle')}</p>
        </div>
        <Button asChild variant="outline"><Link href="/subjects">{t('learn.allSubjects')}</Link></Button>
      </header>

      {overview.isPending ? <Skeleton className="h-36 w-full" /> : <NextLessonCard lesson={overview.data?.nextLesson ?? null} />}

      <section aria-labelledby="my-subjects" className="space-y-3">
        <h2 id="my-subjects" className="text-lg font-semibold">{t('learn.subjects')}</h2>
        {subjects.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
        ) : subjects.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('learn.noSubjects')}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.data.map((s) => (
              <SubjectTile
                key={s.id} slug={s.slug} name={s.name} icon={s.icon} color={s.color} meta={t('subjects.topics', { count: s.topics })}
                progress={{ pct: percentOf(s.lessons.completed, s.lessons.total), label: t('subject.lessons', { done: s.lessons.completed, total: s.lessons.total }) }}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recs" className="space-y-3">
        <h2 id="recs" className="text-lg font-semibold">{t('learn.recommended')}</h2>
        {recs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('learn.noRecs')}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {recs.map((r) => (
              <li key={r.id}>
                <Card className="h-full">
                  <CardContent className="space-y-3 p-4">
                    <div><p className="font-semibold">{r.title}</p><p className="mt-1 text-sm text-muted-foreground">{r.description}</p></div>
                    <Button asChild size="sm"><Link href={recommendationHref(r)}>{t('dashboard.ai.open')}</Link></Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
