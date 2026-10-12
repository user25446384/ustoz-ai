'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

export function useLogout() {
  const router = useRouter();
  const { te } = useT();
  return useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Tarmoq xatosi: cookie o'chmagan, chiqib bo'lmadi. Boshqa xatolarda (masalan sessiya allaqachon tugagan) davom etamiz.
      if (isApiError(err) && err.status === 0) { toast.error(errorText(err, te)); return; }
    }
    router.replace('/login'); // kesh /login ga o'tganda SessionWatcher tomonidan tozalanadi
  }, [router, te]);
}
