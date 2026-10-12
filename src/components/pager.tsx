'use client';

import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const { t } = useT();
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={t('common.pagination')} className="flex items-center justify-between gap-3 pt-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('common.prev')}</Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">{t('common.pageOf', { page, total: totalPages })}</span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>{t('common.next')}</Button>
    </nav>
  );
}
