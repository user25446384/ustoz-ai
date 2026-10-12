'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Lock } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BandBadge } from './band-badge';
import { buildTree, percentOf, sumLessons, type TreeNode } from './helpers';
import type { PlainSubject, Roadmap, RoadmapTopic } from './types';

function Node({ item }: { item: TreeNode<RoadmapTopic> }) {
  const { t } = useT();
  const tp = item.node;
  const agg = sumLessons(item);
  const pct = percentOf(agg.completed, agg.total);
  return (
    <li>
      <Link
        href={`/topics/${tp.slug}`}
        className={cn(
          'flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !tp.unlocked && 'opacity-80',
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
          {tp.unlocked ? <BookOpen className="size-4" /> : <Lock className="size-4" />}
        </span>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block truncate font-medium">{tp.title}</span>
          <span className="block text-xs text-muted-foreground">
            {t('subject.lessons', { done: agg.completed, total: agg.total })}{!tp.unlocked && ` · ${t('subject.locked')}`}
          </span>
          <span className="block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </span>
        </span>
        <BandBadge band={tp.band} />
      </Link>
      {item.children.length > 0 && (
        <ul className="ml-4 mt-2 space-y-2 border-l pl-4">{item.children.map((c) => <Node key={c.node.id} item={c} />)}</ul>
      )}
    </li>
  );
}

export function SubjectView({ slug }: { slug: string }) {
  const { t, te } = useT();
  const enc = encodeURIComponent(slug);
  const { data: me } = useMe();
  const isStudent = me?.role === 'STUDENT';

  const subject = useQuery({ queryKey: ['subject', slug], queryFn: ({ signal }) => api.get<PlainSubject>(`/subjects/${enc}`, { signal }) });
  const roadmap = useQuery({ queryKey: ['roadmap', slug], enabled: isStudent, queryFn: ({ signal }) => api.get<Roadmap>(`/progress/subjects/${enc}/roadmap`, { signal }) });

  if (subject.isError) return <ErrorState message={errorText(subject.error, te)} onRetry={() => void subject.refetch()} />;
  if (subject.isPending || (isStudent && roadmap.isPending)) {
    return <div className="space-y-4" aria-busy="true"><Skeleton className="h-10 w-72" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  const s = subject.data;
  const tree = roadmap.data ? buildTree(roadmap.data.topics) : null;
  const total = tree ? tree.reduce((acc, n) => { const x = sumLessons(n); return { total: acc.total + x.total, completed: acc.completed + x.completed }; }, { total: 0, completed: 0 }) : null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t('subjects.title'), href: '/subjects' }, { label: s.name }]} />
      <header className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${s.color ?? '#6366F1'}22` }} aria-hidden>{s.icon ?? '📘'}</span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{s.name}</h1>
          {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
        </div>
      </header>

      {total && total.total > 0 && (
        <div className="space-y-1.5 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between text-sm"><span className="font-medium">{t('subject.progress')}</span><span className="text-muted-foreground">{t('subject.lessons', { done: total.completed, total: total.total })}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percentOf(total.completed, total.total)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${percentOf(total.completed, total.total)}%` }} />
          </div>
        </div>
      )}

      <section aria-labelledby="topics-h" className="space-y-3">
        <h2 id="topics-h" className="text-lg font-semibold">{t('subject.topics')}</h2>
        {tree ? (
          tree.length === 0 ? <p className="text-sm text-muted-foreground">{t('subject.noTopics')}</p> : <ul className="space-y-2">{tree.map((n) => <Node key={n.node.id} item={n} />)}</ul>
        ) : s.topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('subject.noTopics')}</p>
        ) : (
          <ul className="space-y-2">
            {s.topics.map((tp) => (
              <li key={tp.id}>
                <Link href={`/topics/${tp.slug}`} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <BookOpen className="size-4 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{tp.title}</span><span className="text-xs text-muted-foreground">{t('subject.lessons', { done: 0, total: tp._count.lessons })}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
