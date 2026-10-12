'use client';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { api } from '@/lib/api/client';
import type { Me } from '@/lib/api/types';
import { meKey } from '@/lib/auth/use-me';

export type ThemeValue = 'light' | 'dark' | 'system';

/** Mavzu brauzerda darhol o'zgaradi; tizimga kirgan bo'lsa, hisobda ham saqlanadi (boshqa qurilmalarda ham shu mavzu). */
export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const { data: me } = useQuery<Me>({ queryKey: meKey, queryFn: skipToken }); // faqat keshni o'qiydi, so'rov yubormaydi

  const set = useCallback((next: ThemeValue) => {
    setTheme(next);
    if (!me) return;
    qc.setQueryData<Me>(meKey, (m) => (m ? { ...m, theme: next } : m));
    api.patch('/users/me', { theme: next }).catch(() => undefined);
  }, [me, qc, setTheme]);

  return { theme: theme as ThemeValue | undefined, set };
}
