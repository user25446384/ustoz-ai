'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const { t } = useT();
  return (
    <nav aria-label={t('common.breadcrumb')}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1">
              {it.href && !last ? (
                <Link href={it.href} className="max-w-[12rem] truncate hover:text-foreground hover:underline">{it.label}</Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn('max-w-[16rem] truncate', last && 'font-medium text-foreground')}>{it.label}</span>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
