'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function StepFrame({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 ref={ref} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">{title}</h1>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
