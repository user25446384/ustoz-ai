'use client';

import * as Menu from '@radix-ui/react-dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

const REASONS = ['INCORRECT', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER'] as const;

export function ReportButton({ targetType, targetId }: { targetType: 'LESSON' | 'QUIZ'; targetId: string }) {
  const { t, te } = useT();
  const report = useMutation({
    mutationFn: (reason: string) => api.post('/reports', { targetType, targetId, reason }),
    onSuccess: () => toast.success(t('report.sent')),
    onError: (e) => toast.error(errorText(e, te)),
  });
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="sm" aria-label={t('report.button')}><Flag aria-hidden /><span className="hidden sm:inline">{t('report.button')}</span></Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={6} className="z-50 w-56 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
          <p className="px-2.5 py-1.5 text-xs text-muted-foreground">{t('report.title')}</p>
          {REASONS.map((r) => (
            <Menu.Item key={r} onSelect={() => report.mutate(r)} className="cursor-pointer rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-accent">
              {te(`report.reasons.${r}`)}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
