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
import { isApiError } from '@/lib/api/errors';
import type { Me } from '@/lib/api/types';
import { meKey, usePublicSettings } from '@/lib/auth/use-me';
import { errorText, fieldErrorKey } from '@/lib/errors';
import { useT, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { registerSchema, type RegisterValues } from './schemas';
import { useRedirectIfAuthed } from './use-redirect-if-authed';

const ROLES = ['STUDENT', 'TEACHER', 'PARENT'] as const;
const ROLE_LABEL: Record<(typeof ROLES)[number], MessageKey> = { STUDENT: 'roles.student', TEACHER: 'roles.teacher', PARENT: 'roles.parent' };
const ROLE_DESC: Record<(typeof ROLES)[number], MessageKey> = {
  STUDENT: 'auth.register.roleDesc.student', TEACHER: 'auth.register.roleDesc.teacher', PARENT: 'auth.register.roleDesc.parent',
};
const SERVER_FIELDS = ['fullName', 'username', 'email', 'phone', 'password', 'confirmPassword', 'role'] as const;

export function RegisterForm() {
  const { t, te } = useT();
  const qc = useQueryClient();
  const settings = usePublicSettings();
  const closed = settings.data?.registrationEnabled === false;
  const [formError, setFormError] = useState<string | null>(null);
  useRedirectIfAuthed();

  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT', fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '' },
  });
  const role = watch('role');
  const fe = (m?: string) => (m ? te(m, m) : undefined);

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      const { user } = await api.post<{ user: Me }>('/auth/register', { ...v, phone: v.phone || undefined });
      qc.setQueryData(meKey, user);
      toast.success(t('auth.register.success'));
    } catch (err) {
      if (isApiError(err) && err.code === 'USER_EXISTS') {
        const fields = Array.isArray(err.details.fields) ? (err.details.fields as string[]) : [];
        const known = fields.filter((f): f is 'email' | 'username' | 'phone' => ['email', 'username', 'phone'].includes(f));
        if (known.length) { known.forEach((f) => setError(f, { message: 'validation.taken' })); return; }
      }
      if (isApiError(err) && err.code === 'VALIDATION_ERROR') {
        let shown = false;
        for (const [field, codes] of Object.entries(err.fieldErrors)) {
          if ((SERVER_FIELDS as readonly string[]).includes(field)) {
            setError(field as (typeof SERVER_FIELDS)[number], { message: fieldErrorKey(codes[0], te) });
            shown = true;
          }
        }
        if (shown) return;
      }
      setFormError(errorText(err, te));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.register.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.register.subtitle')}</p>
      </div>
      {closed && <Alert variant="destructive">{t('auth.register.closed')}</Alert>}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert variant="destructive">{formError}</Alert>}

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">{t('auth.register.role')}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ROLES.map((r) => (
              <label
                key={r}
                className={cn(
                  'cursor-pointer rounded-xl border bg-card p-3 text-sm transition-colors hover:bg-accent',
                  'has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                )}
              >
                <input type="radio" value={r} className="sr-only" {...register('role')} />
                <span className="block font-medium">{t(ROLE_LABEL[r])}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{t(ROLE_DESC[r])}</span>
              </label>
            ))}
          </div>
          {role === 'TEACHER' && <p className="text-xs text-muted-foreground">{t('auth.register.teacherNote')}</p>}
        </fieldset>

        <Field label={t('auth.register.fullName')} error={fe(errors.fullName?.message)}>
          {(p) => <Input {...p} {...register('fullName')} autoComplete="name" />}
        </Field>
        <Field label={t('auth.register.username')} hint={t('auth.register.usernameHint')} error={fe(errors.username?.message)}>
          {(p) => <Input {...p} {...register('username')} autoComplete="username" autoCapitalize="none" spellCheck={false} />}
        </Field>
        <Field label={t('auth.register.email')} error={fe(errors.email?.message)}>
          {(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" />}
        </Field>
        <Field label={t('auth.register.phone')} hint={t('auth.register.phoneHint')} error={fe(errors.phone?.message)} optional>
          {(p) => <Input {...p} {...register('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="+998" />}
        </Field>
        <Field label={t('auth.register.password')} hint={t('auth.register.passwordHint')} error={fe(errors.password?.message)}>
          {(p) => <PasswordInput {...p} {...register('password')} autoComplete="new-password" />}
        </Field>
        <Field label={t('auth.register.confirm')} error={fe(errors.confirmPassword?.message)}>
          {(p) => <PasswordInput {...p} {...register('confirmPassword')} autoComplete="new-password" />}
        </Field>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting} disabled={closed}>{t('auth.register.submit')}</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.register.haveAccount')}{' '}
        <Link href="/login" className="font-medium text-primary-strong hover:underline">{t('auth.register.signIn')}</Link>
      </p>
    </div>
  );
}
