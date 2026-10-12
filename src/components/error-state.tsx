'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useT();
  return (
    <div role="alert" className="mx-auto flex min-h-[50dvh] max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive"><AlertCircle aria-hidden /></span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>{t('common.retry')}</Button>}
    </div>
  );
}
