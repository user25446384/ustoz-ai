'use client';

import type { ReactNode } from 'react';
import type { Me } from '@/lib/api/types';
import { useNotificationStream } from '@/lib/notifications/use-notification-stream';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Banners } from './banners';
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AppShell({ me, children }: { me: Me; children: ReactNode }) {
  const { t } = useT();
  const student = me.role === 'STUDENT';
  useNotificationStream(true);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg"
      >
        {t('common.skipToContent')}
      </a>
      <Sidebar role={me.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar me={me} />
        <Banners me={me} />
        <main id="main" tabIndex={-1} className={cn('mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 focus:outline-none lg:px-8', student && 'pb-24 lg:pb-8')}>
          {children}
        </main>
      </div>
      {student && <BottomNav />}
    </div>
  );
}
