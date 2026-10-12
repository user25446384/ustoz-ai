'use client';

import type { Band } from '@/features/dashboard/types';
import { useT, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const KEY: Record<Band, MessageKey> = { WEAK: 'band.weak', PRACTICE: 'band.practice', STRONG: 'band.strong', NOT_ASSESSED: 'band.notAssessed' };
const STYLE: Record<Band, string> = {
  WEAK: 'bg-destructive/15 text-destructive', PRACTICE: 'bg-primary/15 text-primary-strong',
  STRONG: 'bg-success/15 text-success-strong', NOT_ASSESSED: 'bg-muted text-muted-foreground',
};

export function BandBadge({ band }: { band: Band }) {
  const { t } = useT();
  return <span className={cn('inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', STYLE[band])}>{t(KEY[band])}</span>;
}
