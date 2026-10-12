import Link from 'next/link';

export function SubjectTile({ slug, name, icon, color, meta, progress }: {
  slug: string; name: string; icon: string | null; color: string | null; meta: string; progress?: { pct: number; label: string };
}) {
  const base = color ?? '#6366F1';
  return (
    <li>
      <Link
        href={`/subjects/${slug}`}
        className="block h-full rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: `${base}22` }} aria-hidden>{icon ?? '📘'}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          </div>
        </div>
        {progress && (
          <div className="mt-4 space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={name} aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full" style={{ width: `${progress.pct}%`, background: base }} />
            </div>
            <p className="text-xs text-muted-foreground">{progress.label}</p>
          </div>
        )}
      </Link>
    </li>
  );
}
