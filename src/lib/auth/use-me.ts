'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import type { Me, PublicSettings } from '@/lib/api/types';

export const meKey = ['me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meKey,
    queryFn: async ({ signal }) => (await api.get<{ user: Me }>('/auth/me', { signal })).user,
    staleTime: 5 * 60_000,
    retry: (count, err) => !(isApiError(err) && err.status >= 400 && err.status < 500) && count < 2,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: ({ signal }) => api.get<PublicSettings>('/settings/public', { signal }),
    staleTime: 60_000,
  });
}
