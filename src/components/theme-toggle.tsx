'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useThemePreference } from '@/lib/theme';
import { useT } from '@/lib/i18n';

export function ThemeToggle() {
  const { t } = useT();
  const { resolvedTheme } = useTheme();
  const { set } = useThemePreference();
  return (
    <Button variant="ghost" size="icon" aria-label={t('theme.toggle')} onClick={() => set(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      <Sun className="dark:hidden" aria-hidden />
      <Moon className="hidden dark:block" aria-hidden />
    </Button>
  );
}
