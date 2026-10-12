import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="text-lg">UstozAI</span>
    </Link>
  );
}
