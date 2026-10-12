'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { useT } from '@/lib/i18n';

export function NotificationBell() {
  const { t } = useT();
  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: ({ signal }) => api.get<{ unread: number }>('/notifications/unread-count', { signal }),
    refetchInterval: 120_000,   // SSE uzilib qolsa ham hisoblagich yangilanadi
    refetchOnWindowFocus: true,
  });
  const n = data?.unread ?? 0;
  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link href="/notifications" aria-label={n ? t('notifications.unread', { count: n }) : t('nav.notifications')}>
        <Bell aria-hidden />
        {n > 0 && (
          <span aria-hidden className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {n > 99 ? '99+' : n}
          </span>
        )}
      </Link>
    </Button>
  );
}
