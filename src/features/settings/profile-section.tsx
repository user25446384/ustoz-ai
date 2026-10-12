'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import type { Me } from '@/lib/api/types';
import { meKey } from '@/lib/auth/use-me';
import { errorText, fieldErrorKey } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { profileSchema, type ProfileValues } from '@/features/auth/schemas';

export function ProfileSection({ me }: { me: Me }) {
  const { t, te } = useT();
  const qc = useQueryClient();
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema), defaultValues: { fullName: me.fullName, phone: me.phone ?? '' },
  });
  const fe = (m?: string) => (m ? te(m, m) : undefined);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const { user } = await api.patch<{ user: Me }>('/users/me', { fullName: v.fullName, ...(v.phone && { phone: v.phone }) });
      qc.setQueryData(meKey, user);
      reset({ fullName: user.fullName, phone: user.phone ?? '' });
      toast.success(t('settings.profile.saved'));
    } catch (err) {
      if (isApiError(err) && err.code === 'CONFLICT') setError('phone', { message: 'validation.taken' });
      else if (isApiError(err) && err.fieldErrors.phone) setError('phone', { message: fieldErrorKey(err.fieldErrors.phone[0], te) });
      else toast.error(errorText(err, te));
    }
  });

  return (
    <Card>
      <CardHeader><CardTitle>{t('settings.profile.title')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label={t('settings.profile.fullName')} error={fe(errors.fullName?.message)}>
            {(p) => <Input {...p} {...register('fullName')} autoComplete="name" />}
          </Field>
          <Field label={t('settings.profile.phone')} error={fe(errors.phone?.message)} optional>
            {(p) => <Input {...p} {...register('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="+998" />}
          </Field>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>{t('common.save')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
