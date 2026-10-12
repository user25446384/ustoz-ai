'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Laptop, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { formatDateTime, parseUserAgent } from '@/lib/utils';

interface SessionRow { id: string; ip: string | null; userAgent: string | null; createdAt: string; lastUsedAt: string; current: boolean }

export function SessionsSection() {
  const { t, te } = useT();
  const qc = useQueryClient();
  const router = useRouter();
  const sessions = useQuery({ queryKey: ['sessions'], queryFn: ({ signal }) => api.get<SessionRow[]>('/auth/sessions', { signal }) });

  const revoke = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/sessions/${id}`),
    onSuccess: () => { toast.success(t('settings.sessions.revoked')); void qc.invalidateQueries({ queryKey: ['sessions'] }); },
    onError: (e) => toast.error(errorText(e, te)),
  });
  const logoutAll = useMutation({
    mutationFn: () => api.post('/auth/logout-all'),
    onSuccess: () => router.replace('/login'), // server cookie'larni o'chirgan
    onError: (e) => toast.error(errorText(e, te)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.sessions.title')}</CardTitle>
        <CardDescription>{t('settings.sessions.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.isPending && <Skeleton className="h-16 w-full" />}
        {sessions.isError && <ErrorState message={errorText(sessions.error, te)} onRetry={() => void sessions.refetch()} />}
        <ul className="space-y-2">
          {sessions.data?.map((s) => {
            const ua = parseUserAgent(s.userAgent);
            const Icon = ua?.os === 'Android' || ua?.os === 'iOS' ? Smartphone : Laptop;
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border p-3">
                <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {ua ? `${ua.browser} · ${ua.os}` : t('settings.sessions.unknownDevice')}
                    {s.current && <span className="ml-2 rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-medium text-success-strong">{t('settings.sessions.current')}</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.ip ? `${s.ip} · ` : ''}{t('settings.sessions.lastUsed')}: {formatDateTime(s.lastUsedAt)}
                  </p>
                </div>
                {!s.current && (
                  <Button size="sm" variant="outline" loading={revoke.isPending && revoke.variables === s.id} onClick={() => revoke.mutate(s.id)}>
                    {t('settings.sessions.revoke')}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
        <Button
          variant="destructive" loading={logoutAll.isPending}
          onClick={() => { if (window.confirm(t('settings.sessions.logoutAllConfirm'))) logoutAll.mutate(); }}
        >
          {t('settings.sessions.logoutAll')}
        </Button>
      </CardContent>
    </Card>
  );
}
