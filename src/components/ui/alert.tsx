import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const STYLES = {
  info: { box: 'border-primary/30 bg-primary/10', icon: Info, color: 'text-primary-strong' },
  success: { box: 'border-success/40 bg-success/10', icon: CheckCircle2, color: 'text-success-strong' },
  destructive: { box: 'border-destructive/40 bg-destructive/10', icon: AlertCircle, color: 'text-destructive' },
} as const;

export function Alert({ variant = 'info', children, className, action }: {
  variant?: keyof typeof STYLES; children: ReactNode; className?: string; action?: ReactNode;
}) {
  const s = STYLES[variant];
  const Icon = s.icon;
  return (
    <div role={variant === 'destructive' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-xl border p-3 text-sm', s.box, className)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', s.color)} aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
