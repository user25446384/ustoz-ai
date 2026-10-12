'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { meKey } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';

export function VerifyEmailView() {
  const { t, te } = useT();
  const qc = useQueryClient();
  const token = useSearchParams().get('token');
  const started = useRef(false);
  const verify = useMutation({
    mutationFn: (tk: string) => api.post('/auth/verify-email', { token: tk }),
    onSuccess: () => qc.invalidateQueries({ queryKey: meKey }),
  });

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify.mutate(token);
  }, [token, verify]);

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t('auth.verify.title')}</h1>
      {!token ? (
        <Alert variant="destructive">{t('auth.verify.noToken')}</Alert>
      ) : verify.isSuccess ? (
        <div className="space-y-4">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <p>{t('auth.verify.success')}</p>
          <Button asChild className="w-full"><Link href="/login">{t('auth.verify.continue')}</Link></Button>
        </div>
      ) : verify.isError ? (
        <div className="space-y-4">
          <Alert variant="destructive">{errorText(verify.error, te) || t('auth.verify.failed')}</Alert>
          <Button asChild variant="outline" className="w-full"><Link href="/login">{t('auth.forgot.back')}</Link></Button>
        </div>
      ) : (
        <p role="status" className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" aria-hidden />{t('auth.verify.verifying')}
        </p>
      )}
    </div>
  );
}
