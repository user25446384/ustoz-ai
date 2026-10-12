'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { homePath } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { greetingKey } from './helpers';
import { AchievementsCard, RecentQuizzesCard, SubjectProgressCard } from './lists';
import { GoalCard, ProgressCard, StreakCard, XpCard } from './stat-cards';
import { NextLessonCard, PlanCard, RecommendationCard, WeakTopicsCard } from './study-cards';
import type { AchievementsData, Overview, PlanListItem, SubjectSummary, TopicProgress } from './types';

const chartSkeleton = () => <Skeleton className="h-72 w-full" />;
const WeeklyChart = dynamic(() => import('./charts').then((m) => m.WeeklyChart), { ssr: false, loading: chartSkeleton });
const QuizChart = dynamic(() => import('./charts').then((m) => m.QuizChart), { ssr: false, loading: chartSkeleton });
const MasteryChart = dynamic(() => import('./charts').then((m) => m.MasteryChart), { ssr: false, loading: chartSkeleton });

export function DashboardView() {
  const { t, te } = useT();
  const router = useRouter();
  const { data: me } = useMe();

  useEffect(() => { if (me && me.role !== 'STUDENT') router.replace(homePath(me)); }, [me, router]);
  const enabled = me?.role === 'STUDENT';

  const overview = useQuery({
    queryKey: ['progress', 'overview'], enabled,
    queryFn: ({ signal }) => api.get<Overview>('/progress/overview', { signal }),
  });
  const subjects = useQuery({
    queryKey: ['progress', 'subjects'], enabled,
    queryFn: ({ signal }) => api.get<SubjectSummary[]>('/progress/subjects', { signal }),
  });
  const topics = useQuery({
    queryKey: ['progress', 'topics', 'dashboard'], enabled,
    queryFn: ({ signal }) => api.getPage<TopicProgress>('/progress/topics', { params: { limit: 8 }, signal }),
  });
  const achievements = useQuery({
    queryKey: ['achievements'], enabled,
    queryFn: ({ signal }) => api.get<AchievementsData>('/achievements', { signal }),
  });
  const plan = useQuery({
    queryKey: ['learning-plans', 'active'], enabled,
    queryFn: ({ signal }) => api.getPage<PlanListItem>('/learning-plans', { params: { status: 'ACTIVE', limit: 1 }, signal }),
  });

  if (!me || !enabled || overview.isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (overview.isError) return <ErrorState message={errorText(overview.error, te)} onRetry={() => void overview.refetch()} />;

  const o = overview.data;
  const hour = new Date().getHours();
  const hasAssessed = o.recentQuizzes.length > 0 || (topics.data?.items.some((p) => p.assessed) ?? false);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.hello', { greeting: t(greetingKey(hour)), name: me.fullName.split(' ')[0] })}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GoalCard daily={o.daily} />
        <StreakCard streak={o.streak} week={o.week} />
        <ProgressCard mastery={o.overallMastery} />
        <XpCard xp={o.xp} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><NextLessonCard lesson={o.nextLesson} /></div>
        <RecommendationCard rec={o.recommendations[0]} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <WeeklyChart week={o.week} goal={o.daily.goalMinutes} />
        <QuizChart quizzes={o.recentQuizzes} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SubjectProgressCard subjects={subjects.data} loading={subjects.isPending} />
        <MasteryChart topics={topics.data?.items ?? []} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <WeakTopicsCard topics={o.weakTopics} hasData={hasAssessed} />
        <RecentQuizzesCard quizzes={o.recentQuizzes} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PlanCard plan={plan.data?.items[0]} loading={plan.isPending} />
        <AchievementsCard data={achievements.data} loading={achievements.isPending} />
      </section>
    </div>
  );
}
