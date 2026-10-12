'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, ListChecks, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { recommendationHref } from '@/features/dashboard/helpers';
import type { Recommendation } from '@/features/dashboard/types';
import { api } from '@/lib/api/client';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { percentOf } from '../helpers';
import { useTopicLessons, useTopicQuizzes } from '../queries';

export function LessonSidebar({ topicId, currentId, student }: { topicId: string; currentId: string; student: boolean }) {
  const { t } = useT();
  const lessons = useTopicLessons(topicId);
  const quizzes = useTopicQuizzes(topicId);
  const recs = useQuery({
    queryKey: ['recommendations', 'unread'], enabled: student,
    queryFn: ({ signal }) => api.getPage<Recommendation>('/ai/recommendations', { params: { isRead: false, limit: 20 }, signal }),
  });
  const list = lessons.data?.items ?? [];
  const done = list.filter((l) => l.completed).length;
  const topicRecs = (recs.data?.items ?? []).filter((r) => r.topicId === topicId);

  return (
    <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
      <Card>
        <CardHeader><CardTitle className="text-base">{t('lesson.topicLessons')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {lessons.isPending ? <Skeleton className="h-24 w-full" /> : (
            <>
              {student && (
                <div className="space-y-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percentOf(done, list.length)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percentOf(done, list.length)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('topic.lessonsDone', { done, total: list.length })}</p>
                </div>
              )}
              <ol className="space-y-1">
                {list.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/lessons/${l.id}`} aria-current={l.id === currentId ? 'page' : undefined}
                      className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', l.id === currentId && 'bg-primary/10 font-medium text-primary-strong')}
                    >
                      {l.completed ? <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden /> : <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('lesson.topicQuizzes')}</CardTitle></CardHeader>
        <CardContent>
          {(quizzes.data?.items.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground">{t('lesson.noQuizzes')}</p> : (
            <ul className="space-y-1">
              {quizzes.data!.items.map((q) => (
                <li key={q.id}>
                  <Link href={`/quizzes/${q.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <ListChecks className="size-4 shrink-0 text-secondary" aria-hidden /><span className="truncate">{q.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {student && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-secondary" aria-hidden />{t('lesson.recs')}</CardTitle></CardHeader>
          <CardContent>
            {topicRecs.length === 0 ? <p className="text-sm text-muted-foreground">{t('lesson.noRecs')}</p> : (
              <ul className="space-y-3">
                {topicRecs.map((r) => (
                  <li key={r.id} className="space-y-1">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                    <Link href={recommendationHref(r)} className="text-xs font-medium text-primary-strong hover:underline">{t('lesson.open')}</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
