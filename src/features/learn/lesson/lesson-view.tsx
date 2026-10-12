'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Bookmark, Bot, CheckCircle2, Clock, FileText, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { ErrorState } from '@/components/error-state';
import { Markdown } from '@/components/markdown';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { formatBytes } from '../helpers';
import { useTopicQuizzes } from '../queries';
import type { CompleteResult, LessonDetail } from '../types';
import { AiLessonTools } from './ai-tools';
import { LessonSidebar } from './lesson-sidebar';
import { NotesPanel } from './notes-panel';
import { ReportButton } from './report-button';

export function LessonView({ id }: { id: string }) {
  const { t, te } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const isStudent = me?.role === 'STUDENT';
  const key = ['lesson', id];

  const lesson = useQuery({ queryKey: key, queryFn: ({ signal }) => api.get<LessonDetail>(`/lessons/${encodeURIComponent(id)}`, { signal }) });
  const quizzes = useTopicQuizzes(lesson.data?.topicId);

  const complete = useMutation({
    mutationFn: () => api.post<CompleteResult>(`/lessons/${id}/complete`),
    onSuccess: (r) => {
      qc.setQueryData<LessonDetail>(key, (l) => (l ? { ...l, completed: true } : l));
      for (const k of ['progress', 'lessons', 'achievements', 'roadmap', 'recommendations', 'learning-plan', 'learning-plans']) void qc.invalidateQueries({ queryKey: [k] });
      if (r.alreadyCompleted || !r.rewards) { toast(t('lesson.completedToast')); return; }
      toast.success(t('lesson.completedToast'), { description: r.rewards.xp > 0 ? t('lesson.xpGained', { count: r.rewards.xp }) : undefined });
      for (const a of r.rewards.achievements) toast.success(t('lesson.achievementToast', { name: a.name }), { description: a.description });
    },
    onError: (e) => toast.error(errorText(e, te)),
  });

  const save = useMutation({
    mutationFn: (next: boolean) => (next ? api.put(`/lessons/${id}/save`) : api.delete(`/lessons/${id}/save`)),
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<LessonDetail>(key);
      qc.setQueryData<LessonDetail>(key, (l) => (l ? { ...l, saved: next } : l));
      return { prev };
    },
    onError: (e, _next, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); toast.error(errorText(e, te)); },
  });

  const ask = useMutation({
    mutationFn: () => api.post<{ id: string }>('/conversations', { lessonId: id }),
    onSuccess: (c) => router.push(`/ai/${c.id}`),
    onError: (e) => toast.error(errorText(e, te)),
  });

  if (lesson.isError) return <ErrorState message={errorText(lesson.error, te)} onRetry={() => void lesson.refetch()} />;
  if (lesson.isPending) return <div className="space-y-4" aria-busy="true"><Skeleton className="h-6 w-80" /><Skeleton className="h-10 w-96" /><Skeleton className="h-96 w-full" /></div>;

  const l = lesson.data;
  const quiz = quizzes.data?.items[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="min-w-0 space-y-6">
        <header className="space-y-3">
          <Breadcrumbs items={[
            { label: t('subjects.title'), href: '/subjects' },
            { label: l.breadcrumb.subject.name, href: `/subjects/${l.breadcrumb.subject.slug}` },
            { label: l.breadcrumb.topic.title, href: `/topics/${l.breadcrumb.topic.slug}` },
            { label: l.title },
          ]} />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{l.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <DifficultyBadge value={l.difficulty} />
                <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t('lesson.minutes', { count: l.estimatedMinutes })}</span>
                {l.completed && <span className="inline-flex items-center gap-1 font-medium text-success-strong"><CheckCircle2 className="size-4" aria-hidden />{t('lesson.completed')}</span>}
              </div>
            </div>
            {me && me.role !== 'ADMIN' && <ReportButton targetType="LESSON" targetId={l.id} />}
          </div>
        </header>

        {!l.isPublished && <Alert>{t('lesson.draft')}</Alert>}

        <Card><CardContent className="p-5 sm:p-8"><Markdown className="text-base leading-relaxed">{l.content}</Markdown></CardContent></Card>

        {l.attachments.length > 0 && (
          <section aria-labelledby="att-h" className="space-y-2">
            <h2 id="att-h" className="text-lg font-semibold">{t('lesson.attachments')}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {l.attachments.map((a) => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(a.size)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isStudent && (
          <div className="flex flex-wrap gap-2">
            <Button size="lg" loading={complete.isPending} disabled={l.completed} onClick={() => complete.mutate()}>
              <CheckCircle2 aria-hidden />{l.completed ? t('lesson.completed') : t('lesson.complete')}
            </Button>
            <Button size="lg" variant="outline" loading={ask.isPending} onClick={() => ask.mutate()}><Bot aria-hidden />{t('lesson.askAi')}</Button>
            {quiz && <Button asChild size="lg" variant="outline"><Link href={`/quizzes/${quiz.id}`}><ListChecks aria-hidden />{t('lesson.takeQuiz')}</Link></Button>}
            <Button size="lg" variant="outline" aria-pressed={l.saved} onClick={() => save.mutate(!l.saved)}>
              <Bookmark className={l.saved ? 'fill-current' : undefined} aria-hidden />{l.saved ? t('lesson.saved') : t('lesson.save')}
            </Button>
          </div>
        )}

        {(l.prev || l.next) && (
          <nav aria-label={t('lesson.navLabel')} className="grid gap-3 sm:grid-cols-2">
            {l.prev ? (
              <Link href={`/lessons/${l.prev.id}`} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ArrowLeft className="size-5 shrink-0" aria-hidden /><span className="min-w-0"><span className="block text-xs text-muted-foreground">{t('lesson.prev')}</span><span className="block truncate font-medium">{l.prev.title}</span></span>
              </Link>
            ) : <span />}
            {l.next && (
              <Link href={`/lessons/${l.next.id}`} className="flex items-center justify-end gap-3 rounded-xl border bg-card p-3 text-right hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">{t('lesson.next')}</span><span className="block truncate font-medium">{l.next.title}</span></span><ArrowRight className="size-5 shrink-0" aria-hidden />
              </Link>
            )}
          </nav>
        )}

        {isStudent && <AiLessonTools lessonId={l.id} />}
        {isStudent && <NotesPanel lessonId={l.id} />}
      </article>

      <LessonSidebar topicId={l.topicId} currentId={l.id} student={!!isStudent} />
    </div>
  );
}
