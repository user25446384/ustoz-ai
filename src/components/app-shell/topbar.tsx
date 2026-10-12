'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';
import type { Me } from '@/lib/api/types';
import { homePath } from '@/lib/auth/routes';
import { useT } from '@/lib/i18n';
import { NAV, SECONDARY } from './nav-config';
import { NavLink } from './nav-link';

export function Topbar({ me }: { me: Me }) {
  const { t } = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hasMenu = me.role !== 'STUDENT'; // talabalarda pastki navigatsiya bor
  const items = [...NAV[me.role], ...SECONDARY.filter((i) => me.role !== 'ADMIN' || i.href !== '/subscription')];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4 lg:h-16 lg:justify-end lg:px-8">
        <div className="flex items-center gap-1 lg:hidden">
          {hasMenu && (
            <Button
              variant="ghost" size="icon" aria-expanded={open} aria-controls="mobile-nav"
              aria-label={open ? t('nav.close') : t('nav.menu')} onClick={() => setOpen((o) => !o)}
            >
              {open ? <X aria-hidden /> : <Menu aria-hidden />}
            </Button>
          )}
          <Logo href={homePath(me)} />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu me={me} />
        </div>
      </div>
      {hasMenu && open && (
        <nav id="mobile-nav" aria-label={t('nav.main')} className="max-h-[70dvh] space-y-1 overflow-y-auto border-t bg-card p-3 lg:hidden">
          {items.map((i) => <NavLink key={i.href} item={i} onNavigate={() => setOpen(false)} />)}
        </nav>
      )}
    </header>
  );
}
