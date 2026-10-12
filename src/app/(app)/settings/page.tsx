'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useMe } from '@/lib/auth/use-me';
import { useT } from '@/lib/i18n';
import { AppearanceSection } from '@/features/settings/appearance-section';
import { PasswordSection } from '@/features/settings/password-section';
import { ProfileSection } from '@/features/settings/profile-section';
import { SessionsSection } from '@/features/settings/sessions-section';

export default function SettingsPage() {
  const { t } = useT();
  const { data: me } = useMe();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {me ? <ProfileSection me={me} /> : <Skeleton className="h-64" />}
          <AppearanceSection />
        </div>
        <div className="space-y-6">
          <PasswordSection />
          <SessionsSection />
        </div>
      </div>
    </div>
  );
}
