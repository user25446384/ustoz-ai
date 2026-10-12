'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/error-state';
import { Pager } from '@/components/pager';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SubjectProgressCard } from '@/features/dashboard/lists';
import { ProgressCard, StreakCard, XpCard } from '@/features/dashboard/stat-cards';
import type { Band, Overview, SubjectSummary, TopicProgress } from '@/features/dashboard/types';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import { homePath } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BandBadge } from '../band-badge';
import type { ActivityData } from '../types';

const ActivityChart = dynamic(() => import('./activity-chart').then((m) => m.ActivityChart), { ssr: false, loading: () => <Skeleton className="h-60 w-full" /> });

type Filter = Band | 'ALL';
const FILTERS: { value: Filter; label: MessageKey }[] = [
  { value: 'ALL', label: 'progressPage.all' }, { value: 'WEAK', label: 'band.weak' }, { value: 'PRACTICE', label: 'band.practice' },
  { value: 'STRONG', label: 'band.strong' }, { value: 'NOT_ASSESSED', label: 'band.notAssessed' },
];
const BAR: Record<Band, string> = { WEAK: 'hsl(var(--destructive))', PRACTICE: 'hsl(var(--primary))', STRONG: 'hsl(var(--success))', NOT_ASSESSED: 'hsl(var(--muted-foreground))' };

export function ProgressView() {
  const { t, te } = useT();
  const router = useRouter();
  const { data: me } = useMe();
  useEffect(() => { if (me && me.role !== 'STUDENT') router.replace(homePath(me)); }, [me, router]);
  const enabled = me?.role === 'STUDENT';

  const [days, setDays] = useState<7 | 30>(7);
  const [band, setBand] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);

  const overview = useQuery({ queryKey: ['progress', 'overview'], enabled, queryFn: ({ signal }) => api.get<Overview>('/progress/overview', { signal }) });
  const subjects = useQuery({ queryKey: ['progress', 'subjects'], enabled, queryFn: ({ signal }) => api.get<SubjectSummary[]>('/progress/subjects', { signal }) });
  const activity = useQuery({
    queryKey: ['progress', 'activity', days], enabled, placeholderData: keepPreviousData,
    queryFn: ({ signal }) => api.get<ActivityData>('/progress/activity', { params: { days }, signal }),
  });
  const topics = useQuery({
    queryKey: ['progress', 'topics', 'list', band, page], enabled, placeholderData: keepPreviousData,
    queryFn: ({ signal }) => api.getPage<TopicProgress>('/progress/topics', { params: { band: band === 'ALL' ? undefined : band, page, limit: 10 }, signal }),
  });

  if (overview.isError) return <ErrorState message={errorText(overview.error, te)} onRetry={() => void overview.refetch()} />;
  const locked = isApiError(activity.error) && activity.error.code === 'FEATURE_LOCKED';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('progressPage.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('progressPage.subtitle')}</p>
      </header>

      {overview.isPending ? (
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          <XpCard xp={overview.data.xp} />
          <StreakCard streak={overview.data.streak} week={overview.data.week} />
          <ProgressCard mastery={overview.data.overallMastery} />
        </section>
      )}

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle>{t('progressPage.activity')}</CardTitle>
          <div role="radiogroup" aria-label={t('progressPage.range')} className="flex gap-1 rounded-xl border p-1">
            {([7, 30] as const).map((d) => (
              <button
                key={d} type="button" role="radio" aria-checked={days === d} onClick={() => setDays(d)}
                className={cn('rounded-lg px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', days === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}
              >
                {d === 7 ? t('progressPage.days7') : t('progressPage.days30')}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {locked ? (
            <Alert action={<Button asChild size="sm"><Link href="/subscription">{t('progressPage.upgrade')}</Link></Button>}>{t('progressPage.locked')}</Alert>
          ) : activity.isError ? (
            <ErrorState message={errorText(activity.error, te)} onRetry={() => void activity.refetch()} />
          ) : activity.data ? (
            <>
              <p className="text-sm text-muted-foreground">{t('progressPage.totalMinutes', { count: activity.data.totalMinutes })} · {t('progressPage.totalXp', { count: activity.data.totalXp })}</p>
              <ActivityChart data={activity.data} />
            </>
          ) : <Skeleton className="h-60 w-full" />}
        </CardContent>
      </Card>

      <SubjectProgressCard subjects={subjects.data} loading={subjects.isPending} />

      <Card>
        <CardHeader><CardTitle>{t('progressPage.topics')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div role="radiogroup" aria-label={t('progressPage.filter')} className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value} type="button" role="radio" aria-checked={band === f.value} onClick={() => { setBand(f.value); setPage(1); }}
                className={cn('rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', band === f.value ? 'border-primary bg-primary/10 font-medium text-primary-strong' : 'hover:bg-accent')}
              >
                {t(f.label)}
              </button>
            ))}
          </div>

          {topics.isError ? <ErrorState message={errorText(topics.error, te)} onRetry={() => void topics.refetch()} /> : !topics.data ? <Skeleton className="h-48 w-full" /> : topics.data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('progressPage.empty')}</p>
          ) : (
            <ul className="divide-y">
              {topics.data.items.map((p) => (
                <li key={p.topicId}>
                  <Link href={`/topics/${p.topic.slug}`} className="block space-y-1.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0"><span className="block truncate font-medium">{p.topic.title}</span><span className="text-xs text-muted-foreground">{p.topic.subject.name} · {t('progressPage.attempts', { count: p.quizAttempts })}</span></span>
                      <span className="flex shrink-0 items-center gap-2"><span className="text-sm tabular-nums text-muted-foreground">{Math.round(p.mastery)}%</span><BandBadge band={p.band} /></span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden><div className="h-full rounded-full" style={{ width: `${p.mastery}%`, background: BAR[p.band] }} /></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Pager page={page} totalPages={topics.data?.meta.totalPages ?? 1} onChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
