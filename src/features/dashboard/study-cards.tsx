'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { useT } from '@/lib/i18n';
import { BAND_COLOR, recommendationHref } from './helpers';
import type { Overview, PlanListItem, Recommendation, TopicProgress } from './types';

export function NextLessonCard({ lesson }: { lesson: Overview['nextLesson'] }) {
  const { t } = useT();
  return (
    <Card className="h-full bg-gradient-to-br from-primary/10 via-card to-secondary/10">
      <CardHeader><CardTitle>{t('dashboard.next.title')}</CardTitle></CardHeader>
      <CardContent>
        {lesson ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><BookOpen aria-hidden /></span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{lesson.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {lesson.topic.title} · {t('dashboard.next.minutes', { count: lesson.estimatedMinutes })}
                  {lesson.planDay ? ` · ${t('dashboard.next.planDay', { day: lesson.planDay })}` : ''}
                </p>
              </div>
            </div>
            <Button asChild size="lg"><Link href={`/lessons/${lesson.id}`}>{t('dashboard.next.continue')}</Link></Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t('dashboard.next.empty')}</p>
            <Button asChild variant="outline"><Link href="/learn">{t('dashboard.next.browse')}</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecommendationCard({ rec }: { rec: Recommendation | undefined }) {
  const { t } = useT();
  const qc = useQueryClient();
  const dismiss = useMutation({
    mutationFn: (id: string) => api.patch(`/ai/recommendations/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress', 'overview'] }),
  });
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-secondary" aria-hidden />{t('dashboard.ai.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {rec ? (
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{rec.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm"><Link href={recommendationHref(rec)}>{t('dashboard.ai.open')}</Link></Button>
              <Button size="sm" variant="ghost" loading={dismiss.isPending} onClick={() => dismiss.mutate(rec.id)}>{t('dashboard.ai.dismiss')}</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.ai.empty')}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function WeakTopicsCard({ topics, hasData }: { topics: TopicProgress[]; hasData: boolean }) {
  const { t } = useT();
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.weak.title')}</CardTitle></CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">{hasData ? t('dashboard.weak.empty') : t('dashboard.weak.noData')}</p>
        ) : (
          <ul className="space-y-3">
            {topics.map((p) => (
              <li key={p.topicId}>
                <Link href={`/topics/${p.topic.slug}`} className="block space-y-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium">{p.topic.title}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{Math.round(p.mastery)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className="h-full rounded-full" style={{ width: `${p.mastery}%`, background: BAND_COLOR.WEAK }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{p.topic.subject.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function PlanCard({ plan, loading }: { plan: PlanListItem | undefined; loading: boolean }) {
  const { t } = useT();
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.plan.title')}</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-16 w-full" /> : plan ? (
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{plan.title}</p>
              <p className="text-xs text-muted-foreground">{plan.subject?.name} · {t('dashboard.plan.lessons', { done: plan.progress.completed, total: plan.progress.total })}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={plan.progress.percentage} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary" style={{ width: `${plan.progress.percentage}%` }} />
            </div>
            <Button asChild size="sm" variant="outline"><Link href={`/learning-plan/${plan.id}`}>{t('dashboard.plan.open')}</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('dashboard.plan.empty')}</p>
            <Button asChild size="sm"><Link href="/learning-plan">{t('dashboard.plan.create')}</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
