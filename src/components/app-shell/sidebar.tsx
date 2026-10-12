'use client';

import { Logo } from '@/components/logo';
import type { Role } from '@/lib/api/types';
import { homePath } from '@/lib/auth/routes';
import { useT } from '@/lib/i18n';
import { NavLink } from './nav-link';
import { NAV, SECONDARY } from './nav-config';

export function Sidebar({ role }: { role: Role }) {
  const { t } = useT();
  const secondary = role === 'ADMIN' ? SECONDARY.filter((i) => i.href !== '/subscription') : SECONDARY;
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo href={homePath({ role, student: { onboarded: true } })} />
      </div>
      <nav aria-label={t('nav.main')} className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV[role].map((i) => <NavLink key={i.href} item={i} />)}
      </nav>
      <div className="space-y-1 border-t p-3">
        {secondary.map((i) => <NavLink key={i.href} item={i} />)}
      </div>
    </aside>
  );
}
