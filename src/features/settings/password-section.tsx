'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { changePasswordSchema, type ChangePasswordValues } from '@/features/auth/schemas';

export function PasswordSection() {
  const { t, te } = useT();
  const qc = useQueryClient();
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const fe = (m?: string) => (m ? te(m, m) : undefined);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await api.post('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword });
      reset();
      void qc.invalidateQueries({ queryKey: ['sessions'] }); // boshqa qurilmalar yopildi
      toast.success(t('settings.security.changed'));
    } catch (err) {
      if (isApiError(err) && err.code === 'INVALID_CURRENT_PASSWORD') setError('currentPassword', { message: 'errors.INVALID_CURRENT_PASSWORD' });
      else toast.error(errorText(err, te));
    }
  });

  return (
    <Card>
      <CardHeader><CardTitle>{t('settings.security.title')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label={t('settings.security.current')} error={fe(errors.currentPassword?.message)}>
            {(p) => <PasswordInput {...p} {...register('currentPassword')} autoComplete="current-password" />}
          </Field>
          <Field label={t('settings.security.new')} hint={t('auth.register.passwordHint')} error={fe(errors.newPassword?.message)}>
            {(p) => <PasswordInput {...p} {...register('newPassword')} autoComplete="new-password" />}
          </Field>
          <Field label={t('settings.security.confirm')} error={fe(errors.confirmPassword?.message)}>
            {(p) => <PasswordInput {...p} {...register('confirmPassword')} autoComplete="new-password" />}
          </Field>
          <Button type="submit" loading={isSubmitting}>{t('settings.security.submit')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
