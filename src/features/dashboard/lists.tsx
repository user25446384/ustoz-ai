'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import { shortDate } from './helpers';
import type { AchievementsData, Overview, SubjectSummary } from './types';

export function SubjectProgressCard({ subjects, loading }: { subjects: SubjectSummary[] | undefined; loading: boolean }) {
  const { t } = useT();
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.subjects.title')}</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-32 w-full" /> : !subjects?.length ? (
          <p className="text-sm text-muted-foreground">{t('dashboard.subjects.empty')}</p>
        ) : (
          <ul className="space-y-4">
            {subjects.map((s) => {
              const pct = s.lessons.total ? Math.round((s.lessons.completed / s.lessons.total) * 100) : 0;
              return (
                <li key={s.id}>
                  <Link href={`/subjects/${s.slug}`} className="block space-y-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2 font-medium"><span aria-hidden>{s.icon ?? '📘'}</span><span className="truncate">{s.name}</span></span>
                      <span className="shrink-0 text-muted-foreground">{t('dashboard.subjects.lessons', { done: s.lessons.completed, total: s.lessons.total })}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={s.name}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color ?? 'hsl(var(--primary))' }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.avgMastery === null ? t('dashboard.subjects.notAssessed') : t('dashboard.subjects.mastery', { value: Math.round(s.avgMastery) })}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentQuizzesCard({ quizzes }: { quizzes: Overview['recentQuizzes'] }) {
  const { t } = useT();
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.recent.title')}</CardTitle></CardHeader>
      <CardContent>
        {quizzes.length === 0 ? <p className="text-sm text-muted-foreground">{t('dashboard.recent.empty')}</p> : (
          <ul className="divide-y">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Link href={`/quiz/${q.id}/result`} className="flex items-center justify-between gap-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="min-w-0"><span className="block truncate font-medium">{q.quiz.title}</span><span className="text-xs text-muted-foreground">{shortDate(q.completedAt)}</span></span>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-semibold tabular-nums">{Math.round(q.percentage)}%</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function AchievementsCard({ data, loading }: { data: AchievementsData | undefined; loading: boolean }) {
  const { t } = useT();
  const earned = (data?.items ?? []).filter((a) => a.earned).sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? '')).slice(0, 4);
  const upcoming = (data?.items ?? [])
    .filter((a) => !a.earned && a.progress && a.progress.target > 0)
    .sort((a, b) => b.progress!.current / b.progress!.target - a.progress!.current / a.progress!.target)
    .slice(0, 2);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{t('dashboard.achievements.title')}</CardTitle>
        <Button asChild variant="link" size="sm"><Link href="/achievements">{t('dashboard.achievements.all')}</Link></Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <Skeleton className="h-24 w-full" /> : !data ? null : (
          <>
            {earned.length === 0 ? <p className="text-sm text-muted-foreground">{t('dashboard.achievements.empty')}</p> : (
              <>
                <p className="text-xs text-muted-foreground">{t('dashboard.achievements.earned', { earned: data.earnedCount, total: data.total })}</p>
                <ul className="flex flex-wrap gap-2">
                  {earned.map((a) => (
                    <li key={a.id} title={a.description} className="flex items-center gap-1.5 rounded-xl border bg-card px-2.5 py-1.5 text-sm">
                      <span aria-hidden>{a.icon ?? '🏆'}</span>{a.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {upcoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t('dashboard.achievements.next')}</p>
                {upcoming.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5"><span aria-hidden>{a.icon ?? '🏆'}</span>{a.name}</span><span className="text-xs tabular-nums text-muted-foreground">{a.progress!.current}/{a.progress!.target}</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden><div className="h-full rounded-full bg-secondary" style={{ width: `${(a.progress!.current / a.progress!.target) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
