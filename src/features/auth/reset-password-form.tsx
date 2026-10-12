'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { resetSchema, type ResetValues } from './schemas';

export function ResetPasswordForm() {
  const { t, te } = useT();
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema), defaultValues: { password: '', confirmPassword: '' },
  });
  const fe = (m?: string) => (m ? te(m, m) : undefined);

  if (!token) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">{t('auth.reset.noToken')}</Alert>
        <Button asChild className="w-full"><Link href="/forgot-password">{t('auth.reset.requestNew')}</Link></Button>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      await api.post('/auth/reset-password', { token, ...v });
      toast.success(t('auth.reset.success'));
      router.replace('/login');
    } catch (err) {
      setFormError(errorText(err, te));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.reset.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.reset.subtitle')}</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert variant="destructive">{formError}</Alert>}
        <Field label={t('auth.reset.password')} hint={t('auth.register.passwordHint')} error={fe(errors.password?.message)}>
          {(p) => <PasswordInput {...p} {...register('password')} autoComplete="new-password" />}
        </Field>
        <Field label={t('auth.reset.confirm')} error={fe(errors.confirmPassword?.message)}>
          {(p) => <PasswordInput {...p} {...register('confirmPassword')} autoComplete="new-password" />}
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>{t('auth.reset.submit')}</Button>
      </form>
    </div>
  );
}
