'use client';

import { useT, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const KEY: Record<Difficulty, MessageKey> = { EASY: 'difficulty.easy', MEDIUM: 'difficulty.medium', HARD: 'difficulty.hard' };
const STYLE: Record<Difficulty, string> = {
  EASY: 'bg-success/15 text-success-strong', MEDIUM: 'bg-primary/15 text-primary-strong', HARD: 'bg-destructive/15 text-destructive',
};

export function DifficultyBadge({ value, className }: { value: Difficulty; className?: string }) {
  const { t } = useT();
  return <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', STYLE[value], className)}>{t(KEY[value])}</span>;
}
