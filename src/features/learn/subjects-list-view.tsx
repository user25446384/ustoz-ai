'use client';

import { useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { SubjectTile } from './subject-tile';
import type { SubjectListItem } from './types';

export function SubjectsListView() {
  const { t, te } = useT();
  const subjects = useQuery({
    queryKey: ['subjects', 'all'], staleTime: 5 * 60_000,
    queryFn: ({ signal }) => api.getPage<SubjectListItem>('/subjects', { params: { limit: 100 }, signal }),
  });
  if (subjects.isError) return <ErrorState message={errorText(subjects.error, te)} onRetry={() => void subjects.refetch()} />;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('subjects.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subjects.subtitle')}</p>
      </header>
      {subjects.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : subjects.data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('subjects.empty')}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.data.items.map((s) => (
            <SubjectTile key={s.id} slug={s.slug} name={s.name} icon={s.icon} color={s.color} meta={t('subjects.topics', { count: s._count?.topics ?? 0 })} />
          ))}
        </ul>
      )}
    </div>
  );
}
