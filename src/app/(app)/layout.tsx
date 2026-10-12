'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { isUnauthorized } from '@/lib/api/errors';
import { homePath, requiredRole } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh" aria-busy="true">
      <div className="hidden w-64 shrink-0 space-y-3 border-r p-4 lg:block">
        <Skeleton className="h-9 w-32" />
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}
      </div>
      <div className="flex-1 space-y-4 p-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { te } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, error, isPending, refetch } = useMe();
  const need = requiredRole(pathname);
  const wrongRole = !!me && !!need && me.role !== need;
  const mustOnboard = !!me && me.role === 'STUDENT' && !!me.student && !me.student.onboarded && pathname !== '/settings';

  useEffect(() => {
    if (isUnauthorized(error)) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (me && wrongRole) router.replace(homePath(me));
    else if (me && mustOnboard) router.replace('/onboarding');
  }, [error, me, wrongRole, mustOnboard, pathname, router]);

  if (isPending) return <ShellSkeleton />;
  if (error && !isUnauthorized(error)) return <ErrorState message={errorText(error, te)} onRetry={() => void refetch()} />;
  if (!me || wrongRole || mustOnboard) return <ShellSkeleton />; // yo'naltirilmoqda

  return <AppShell me={me}>{children}</AppShell>;
}
