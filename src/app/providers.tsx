'use client';

import { QueryClient, QueryClientProvider, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { SESSION_ENDED, sessionEvents } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import type { Me } from '@/lib/api/types';
import { isAuthPath } from '@/lib/auth/routes';
import { meKey } from '@/lib/auth/use-me';
import { I18nProvider } from '@/lib/i18n';

/**
 * Sessiya tugaganda (refresh ham o'tmadi, yoki sessiya bekor qilingan) login'ga yo'naltiradi.
 * Kesh login sahifasiga o'tilganda tozalanadi: keyingi foydalanuvchiga oldingisining ma'lumoti ko'rinmasin.
 * Hodisa takrorlanib ketmasligi uchun har navigatsiyada bir marta ishlaydi.
 */
function SessionWatcher() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const handled = useRef(false);
  pathRef.current = pathname;

  useEffect(() => {
    handled.current = false;
    if (isAuthPath(pathname)) qc.clear();
  }, [pathname, qc]);

  useEffect(() => {
    const onEnd = () => {
      if (handled.current) return;
      handled.current = true;
      void qc.cancelQueries();
      const p = pathRef.current;
      if (!isAuthPath(p) && p !== '/') router.replace(`/login?next=${encodeURIComponent(p)}`);
    };
    sessionEvents.addEventListener(SESSION_ENDED, onEnd);
    return () => sessionEvents.removeEventListener(SESSION_ENDED, onEnd);
  }, [qc, router]);

  return null;
}

/** Hisobda saqlangan mavzuni (boshqa qurilmada tanlangan) kirgandan keyin bir marta qo'llaydi. */
function ThemeSync() {
  const { setTheme } = useTheme();
  const { data: me } = useQuery<Me>({ queryKey: meKey, queryFn: skipToken });
  const appliedFor = useRef<string | null>(null);
  useEffect(() => {
    if (me && appliedFor.current !== me.id) {
      appliedFor.current = me.id;
      if (me.theme) setTheme(me.theme);
    }
  }, [me, setTheme]);
  return null;
}

function AppToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors closeButton position="top-right" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (count, err) => !(isApiError(err) && err.status >= 400 && err.status < 500) && count < 2,
      },
      mutations: { retry: false },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <QueryClientProvider client={client}>
          <SessionWatcher />
          <ThemeSync />
          {children}
          <AppToaster />
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
