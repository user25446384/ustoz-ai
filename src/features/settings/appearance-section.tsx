'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useT, type MessageKey } from '@/lib/i18n';
import { useThemePreference, type ThemeValue } from '@/lib/theme';
import { cn } from '@/lib/utils';

const OPTIONS: { value: ThemeValue; label: MessageKey; icon: typeof Sun }[] = [
  { value: 'light', label: 'theme.light', icon: Sun },
  { value: 'dark', label: 'theme.dark', icon: Moon },
  { value: 'system', label: 'theme.system', icon: Monitor },
];

export function AppearanceSection() {
  const { t } = useT();
  const { theme, set } = useThemePreference();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []); // next-themes qiymati serverda yo'q: hydration mos kelishi uchun

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.appearance.title')}</CardTitle>
        <CardDescription>{t('settings.appearance.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div role="radiogroup" aria-label={t('settings.appearance.title')} className="grid grid-cols-3 gap-2">
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = mounted && theme === value;
            return (
              <button
                key={value} type="button" role="radio" aria-checked={selected} onClick={() => set(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected && 'border-primary bg-primary/10',
                )}
              >
                <Icon className="size-5" aria-hidden />{t(label)}
              </button>
            );
          })}
        </div>
        <div>
          <p className="text-sm font-medium">{t('settings.language.title')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('settings.language.desc')}</p>
          <p className="mt-2 inline-block rounded-lg border bg-muted px-3 py-1.5 text-sm">{t('settings.language.uz')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
