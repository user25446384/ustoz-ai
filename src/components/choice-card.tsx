import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  type: 'radio' | 'checkbox';
  name?: string;
  checked: boolean;
  onChange: () => void;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ChoiceCard({ type, name, checked, onChange, title, description, disabled, className }: Props) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer flex-col gap-0.5 rounded-xl border bg-card p-3 pr-8 text-sm transition-colors hover:bg-accent',
        'has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
        className,
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span className="font-medium">{title}</span>
      {description && <span className="text-xs text-muted-foreground">{description}</span>}
      <Check aria-hidden className="absolute right-2.5 top-2.5 hidden size-4 text-primary-strong group-has-[:checked]:block" />
    </label>
  );
}
