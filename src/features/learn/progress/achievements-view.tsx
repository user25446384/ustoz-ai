'use client';

import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { AchievementsData } from '@/features/dashboard/types';
import { api } from '@/lib/api/client';
import { homePath } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { cn, formatDateTime } from '@/lib/utils';
import { percentOf } from '../helpers';

export function AchievementsView() {
  const { t, te } = useT();
  const router = useRouter();
  const { data: me } = useMe();
  useEffect(() => { if (me && me.role !== 'STUDENT') router.replace(homePath(me)); }, [me, router]);
  const q = useQuery({ queryKey: ['achievements'], enabled: me?.role === 'STUDENT', queryFn: ({ signal }) => api.get<AchievementsData>('/achievements', { signal }) });

  if (q.isError) return <ErrorState message={errorText(q.error, te)} onRetry={() => void q.refetch()} />;
  if (q.isPending) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-32" />)}</div>;

  const d = q.data;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('achievementsPage.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('achievementsPage.subtitle', { earned: d.earnedCount, total: d.total })}</p>
      </header>
      {d.items.length === 0 ? <p className="text-sm text-muted-foreground">{t('achievementsPage.empty')}</p> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.items.map((a) => (
            <li key={a.id} className={cn('relative space-y-3 rounded-2xl border bg-card p-5 shadow-sm', !a.earned && 'opacity-80')}>
              <div className="flex items-start gap-3">
                <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl text-2xl', a.earned ? 'bg-primary/15' : 'bg-muted grayscale')} aria-hidden>{a.icon ?? '🏆'}</span>
                <div className="min-w-0">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </div>
              </div>
              {a.earned ? (
                <p className="text-xs font-medium text-success-strong">{t('achievementsPage.earned')}{a.earnedAt ? ` · ${formatDateTime(a.earnedAt)}` : ''} · {t('achievementsPage.xp', { count: a.xpReward })}</p>
              ) : (
                <div className="space-y-1.5">
                  {a.progress && (
                    <>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percentOf(a.progress.current, a.progress.target)} aria-valuemin={0} aria-valuemax={100} aria-label={a.name}>
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${percentOf(a.progress.current, a.progress.target)}%` }} />
                      </div>
                      <p className="text-xs tabular-nums text-muted-foreground">{a.progress.current} / {a.progress.target}</p>
                    </>
                  )}
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" aria-hidden />{t('achievementsPage.locked')} · {t('achievementsPage.xp', { count: a.xpReward })}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
