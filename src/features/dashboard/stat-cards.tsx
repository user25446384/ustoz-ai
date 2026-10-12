'use client';

import { Check, Flame, Zap } from 'lucide-react';
import { ProgressRing } from '@/components/progress-ring';
import { Card, CardContent } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { goalPercent, weekdayIndex } from './helpers';
import type { Overview } from './types';

export function GoalCard({ daily }: { daily: Overview['daily'] }) {
  const { t } = useT();
  const pct = goalPercent(daily.todayMinutes, daily.goalMinutes);
  const text = t('dashboard.goal.minutes', { done: daily.todayMinutes, goal: daily.goalMinutes });
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <ProgressRing value={pct} label={text} color={daily.goalReached ? 'hsl(var(--success))' : undefined}>
          <span className="text-lg font-bold">{pct}%</span>
        </ProgressRing>
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-muted-foreground">{t('dashboard.goal.title')}</h2>
          <p className="text-lg font-semibold">{text}</p>
          <p className="text-xs text-muted-foreground">
            {daily.goalReached ? t('dashboard.goal.reached') : t('dashboard.goal.left', { count: Math.max(0, daily.goalMinutes - daily.todayMinutes) })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakCard({ streak, week }: { streak: Overview['streak']; week: Overview['week'] }) {
  const { t, te } = useT();
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-12 place-items-center rounded-2xl', streak.current > 0 ? 'bg-orange-500/15 text-orange-500' : 'bg-muted text-muted-foreground')}>
            <Flame className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-muted-foreground">{t('dashboard.streak.title')}</h2>
            <p className="text-lg font-semibold">{t('dashboard.streak.days', { count: streak.current })}</p>
          </div>
        </div>
        <ul className="flex justify-between gap-1">
          {week.map((d) => {
            const day = te(`dashboard.weekdays.${weekdayIndex(d.date)}`);
            const done = d.minutes > 0;
            return (
              <li key={d.date} className="flex flex-col items-center gap-1">
                <span className={cn('grid size-6 place-items-center rounded-full', done ? 'bg-success text-white' : 'bg-muted')} aria-hidden>
                  {done && <Check className="size-3.5" />}
                </span>
                <span className="text-[10px] text-muted-foreground" aria-hidden>{day}</span>
                <span className="sr-only">{day}: {done ? t('dashboard.streak.studiedDay') : t('dashboard.streak.missedDay')}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          {streak.studiedToday ? t('dashboard.streak.studied') : streak.current > 0 ? t('dashboard.streak.remind') : t('dashboard.streak.none')}
        </p>
      </CardContent>
    </Card>
  );
}

export function ProgressCard({ mastery }: { mastery: number | null }) {
  const { t } = useT();
  const value = mastery === null ? 0 : Math.round(mastery);
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <ProgressRing value={value} label={mastery === null ? t('dashboard.progress.empty') : `${value}%`} color="hsl(var(--secondary))">
          <span className="text-lg font-bold">{mastery === null ? '—' : `${value}%`}</span>
        </ProgressRing>
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-muted-foreground">{t('dashboard.progress.title')}</h2>
          <p className="text-lg font-semibold">{t('dashboard.progress.mastery')}</p>
          {mastery === null && <p className="text-xs text-muted-foreground">{t('dashboard.progress.empty')}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function XpCard({ xp }: { xp: Overview['xp'] }) {
  const { t } = useT();
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary-strong"><Zap className="size-6" aria-hidden /></span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-muted-foreground">{t('dashboard.xp.title')}</h2>
            <p className="text-lg font-semibold">{t('dashboard.xp.level', { level: xp.level })} · {t('dashboard.xp.total', { count: xp.total })}</p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={xp.progressPct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${xp.progressPct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{t('dashboard.xp.toNext', { count: Math.max(0, xp.nextLevelXp - xp.total) })}</p>
      </CardContent>
    </Card>
  );
}
