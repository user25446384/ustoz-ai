'use client';

import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useT } from '@/lib/i18n';

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useT();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo className="text-white" />
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">{t('app.tagline')}</h2>
          <p className="text-lg text-white/85">{t('app.subtitle')}</p>
        </div>
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl" />
      </aside>
      <div className="relative flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </div>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">{children}</main>
      </div>
    </div>
  );
}
