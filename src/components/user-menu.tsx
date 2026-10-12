'use client';

import * as Menu from '@radix-ui/react-dropdown-menu';
import { CreditCard, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import type { Me, Role } from '@/lib/api/types';
import { useLogout } from '@/lib/auth/use-logout';
import { useT, type MessageKey } from '@/lib/i18n';
import { initials } from '@/lib/utils';

const ROLE_KEY: Record<Role, MessageKey> = {
  STUDENT: 'roles.student', TEACHER: 'roles.teacher', PARENT: 'roles.parent', ADMIN: 'roles.admin',
};
const ITEM = 'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-accent';

export function Avatar({ me, size = 36 }: { me: Pick<Me, 'avatar' | 'fullName'>; size?: number }) {
  const style = { width: size, height: size };
  return me.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={me.avatar} alt="" style={style} className="rounded-full bg-muted object-cover" />
  ) : (
    <span style={style} className="grid place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white" aria-hidden>
      {initials(me.fullName)}
    </span>
  );
}

export function UserMenu({ me }: { me: Me }) {
  const { t } = useT();
  const logout = useLogout();
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t('nav.userMenu')}
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar me={me} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-60 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium">{me.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{me.email}</p>
            <p className="mt-1 text-xs text-primary-strong">{t(ROLE_KEY[me.role])}</p>
          </div>
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item asChild className={ITEM}>
            <Link href="/settings"><Settings className="size-4" aria-hidden />{t('nav.settings')}</Link>
          </Menu.Item>
          {me.role !== 'ADMIN' && (
            <Menu.Item asChild className={ITEM}>
              <Link href="/subscription"><CreditCard className="size-4" aria-hidden />{t('nav.subscription')}</Link>
            </Menu.Item>
          )}
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item className={ITEM} onSelect={() => void logout()}>
            <LogOut className="size-4" aria-hidden />{t('common.logout')}
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
