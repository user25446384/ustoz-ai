'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { api } from '@/lib/api/client';
import type { Me } from '@/lib/api/types';
import { meKey } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { loginSchema, type LoginValues } from './schemas';
import { useRedirectIfAuthed } from './use-redirect-if-authed';

export function LoginForm() {
  const { t, te } = useT();
  const qc = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  useRedirectIfAuthed();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' },
  });
  const fe = (m?: string) => (m ? te(m, m) : undefined);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user } = await api.post<{ user: Me }>('/auth/login', values);
      qc.setQueryData(meKey, user); // useRedirectIfAuthed yo'naltiradi
      toast.success(t('auth.login.welcome', { name: user.fullName.split(' ')[0] }));
    } catch (err) {
      setFormError(errorText(err, te));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.login.subtitle')}</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert variant="destructive">{formError}</Alert>}
        <Field label={t('auth.login.identifier')} error={fe(errors.identifier?.message)}>
          {(p) => <Input {...p} {...register('identifier')} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder={t('auth.login.identifierPlaceholder')} />}
        </Field>
        <Field label={t('auth.login.password')} error={fe(errors.password?.message)}>
          {(p) => <PasswordInput {...p} {...register('password')} autoComplete="current-password" />}
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary-strong hover:underline">{t('auth.login.forgot')}</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>{t('auth.login.submit')}</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.login.noAccount')}{' '}
        <Link href="/register" className="font-medium text-primary-strong hover:underline">{t('auth.login.signUp')}</Link>
      </p>
    </div>
  );
}
