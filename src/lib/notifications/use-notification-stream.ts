'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { API_BASE, refreshSession } from '@/lib/api/client';

/** SSE: yangi bildirishnoma kelganda toast va hisoblagichni yangilaydi. 401 bo'lsa, tokenni yangilab qayta ulanadi. */
export function useNotificationStream(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return;
    let es: EventSource | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let attempt = 0;
    const invalidate = () => { void qc.invalidateQueries({ queryKey: ['notifications'] }); };

    const open = () => {
      if (stopped) return;
      const source = new EventSource(`${API_BASE}/notifications/stream`, { withCredentials: true });
      es = source;
      source.onopen = () => { attempt = 0; };
      source.addEventListener('notification', (ev) => {
        try {
          const n = (JSON.parse((ev as MessageEvent<string>).data) as { notification?: { title: string; message: string } }).notification;
          if (n) toast(n.title, { description: n.message });
        } catch { /* buzilgan hodisa e'tiborsiz */ }
        invalidate();
      });
      source.addEventListener('refresh', invalidate);
      source.onerror = () => {
        if (source.readyState !== EventSource.CLOSED) return; // uzilish: brauzer o'zi qayta ulanadi
        source.close();                                       // HTTP xato (odatda 401): brauzer qayta urinmaydi
        const retry = (ms: number) => { if (!stopped) timer = setTimeout(open, ms); };
        refreshSession().then((ok) => { if (ok) retry(Math.min(30_000, 1000 * 2 ** attempt++)); }).catch(() => retry(30_000));
      };
    };

    open();
    return () => { stopped = true; clearTimeout(timer); es?.close(); };
  }, [enabled, qc]);
}
