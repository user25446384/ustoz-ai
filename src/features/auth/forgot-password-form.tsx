'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { forgotSchema, type ForgotValues } from './schemas';

export function ForgotPasswordForm() {
  const { t, te } = useT();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema), defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      await api.post('/auth/forgot-password', v);
      setSent(true); // email ro'yxatdan o'tganmi-yo'qmi, har doim bir xil javob
    } catch (err) {
      setFormError(errorText(err, te));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.forgot.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.forgot.subtitle')}</p>
      </div>
      {sent ? (
        <Alert variant="success">{t('auth.forgot.sent')}</Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError && <Alert variant="destructive">{formError}</Alert>}
          <Field label={t('auth.forgot.email')} error={errors.email?.message ? te(errors.email.message) : undefined}>
            {(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" />}
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>{t('auth.forgot.submit')}</Button>
        </form>
      )}
      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary-strong hover:underline">{t('auth.forgot.back')}</Link>
      </p>
    </div>
  );
}
