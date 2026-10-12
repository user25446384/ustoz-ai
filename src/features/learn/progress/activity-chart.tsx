'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useT } from '@/lib/i18n';
import { dateKeyLabel } from '../helpers';
import type { ActivityData } from '../types';

const tick = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 };

export function ActivityChart({ data }: { data: ActivityData }) {
  const { t } = useT();
  const rows = data.days.map((d) => ({ label: dateKeyLabel(d.date), minutes: d.minutes, xp: d.xp }));
  return (
    <>
      <div className="h-60" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} interval={rows.length > 10 ? 'preserveStartEnd' : 0} />
            <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))' }}
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--popover-foreground))', fontSize: 12 }}
              formatter={(v: number, _n, p) => [`${v} ${t('progressPage.minutesLabel')} · ${p.payload.xp} XP`, '']} separator=""
            />
            <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">{rows.map((r) => <li key={r.label}>{r.label}: {r.minutes} {t('progressPage.minutesLabel')}, {r.xp} XP</li>)}</ul>
    </>
  );
}
