'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { homePath, safeNext } from '@/lib/auth/routes';
import { useMe } from '@/lib/auth/use-me';

/** Kirgan foydalanuvchini auth sahifalaridan chiqaradi: `?next=` (xavfsiz bo'lsa) yoki roliga mos bosh sahifaga. */
export function useRedirectIfAuthed() {
  const { data: me } = useMe();
  const router = useRouter();
  const next = useSearchParams().get('next');
  useEffect(() => {
    if (me) router.replace(safeNext(next) ?? homePath(me));
  }, [me, next, router]);
  return me;
}
