'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import type { Me } from '@/lib/api/types';
import { usePublicSettings } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

export function Banners({ me }: { me: Me }) {
  const { t, te } = useT();
  const settings = usePublicSettings();
  const resend = useMutation({
    mutationFn: () => api.post('/auth/resend-verification'),
    onSuccess: () => toast.success(t('banners.resent')),
    onError: (e) => toast.error(errorText(e, te)),
  });
  const maintenance = settings.data?.maintenance;

  if (me.emailVerified && !maintenance?.enabled) return null;
  return (
    <div className="space-y-2 px-4 pt-4 lg:px-8">
      {maintenance?.enabled && (
        <Alert variant="destructive">
          {maintenance.message ?? t('banners.maintenance')}{me.role === 'ADMIN' && ` ${t('banners.maintenanceAdmin')}`}
        </Alert>
      )}
      {!me.emailVerified && (
        <Alert
          action={<Button size="sm" variant="outline" loading={resend.isPending} onClick={() => resend.mutate()}>{t('banners.resend')}</Button>}
        >
          {t('banners.verifyEmail')}
        </Alert>
      )}
    </div>
  );
}
