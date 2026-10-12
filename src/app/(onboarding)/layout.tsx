'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { isUnauthorized } from '@/lib/api/errors';
import { homePath } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const { te } = useT();
  const router = useRouter();
  const { data: me, error, isPending, refetch } = useMe();
  const done = !!me && (me.role !== 'STUDENT' || !!me.student?.onboarded);

  useEffect(() => {
    if (isUnauthorized(error)) router.replace('/login?next=%2Fonboarding');
    else if (me && done) router.replace(homePath(me));
  }, [error, me, done, router]);

  if (error && !isUnauthorized(error)) return <ErrorState message={errorText(error, te)} onRetry={() => void refetch()} />;
  if (isPending || !me || done) return <div className="p-6" aria-busy="true"><Skeleton className="mx-auto h-64 max-w-3xl" /></div>;
  return <>{children}</>;
}
