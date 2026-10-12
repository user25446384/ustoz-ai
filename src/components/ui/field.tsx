'use client';

import { useId, type ReactNode } from 'react';
import { useT } from '@/lib/i18n';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: (p: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}

export function Field({ label, error, hint, optional, children }: FieldProps) {
  const { t } = useT();
  const id = useId();
  const showHint = !!hint && !error;
  const describedBy = error ? `${id}-err` : showHint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">({t('common.optional')})</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {showHint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
