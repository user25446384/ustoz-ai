'use client';

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { BAND_COLOR, shortDate, weekdayIndex } from './helpers';
import type { Overview, TopicProgress } from './types';

const tick = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 };
const tooltipStyle = {
  background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12,
  color: 'hsl(var(--popover-foreground))', fontSize: 12,
};
const grid = 'hsl(var(--border))';

function Empty({ text }: { text: string }) {
  return <p className="grid h-48 place-items-center px-4 text-center text-sm text-muted-foreground">{text}</p>;
}

export function WeeklyChart({ week, goal }: { week: Overview['week']; goal: number }) {
  const { t, te } = useT();
  const data = week.map((d) => ({ label: te(`dashboard.weekdays.${weekdayIndex(d.date)}`), minutes: d.minutes }));
  const empty = data.every((d) => d.minutes === 0);
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.charts.weekly')}</CardTitle></CardHeader>
      <CardContent>
        {empty ? <Empty text={t('dashboard.charts.weeklyEmpty')} /> : (
          <>
            <div className="h-56" aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
                  <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, (max: number) => Math.max(max, goal)]} />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v} ${t('dashboard.charts.minutes')}`, '']} separator="" />
                  <ReferenceLine y={goal} stroke="hsl(var(--success))" strokeDasharray="4 4" label={{ value: t('dashboard.charts.goalLine'), fill: 'hsl(var(--success-strong))', fontSize: 11, position: 'insideTopRight' }} />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {data.map((d, i) => <Cell key={i} fill={d.minutes >= goal ? 'hsl(var(--success))' : 'hsl(var(--primary))'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="sr-only">{data.map((d) => <li key={d.label}>{d.label}: {d.minutes} {t('dashboard.charts.minutes')}</li>)}</ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function QuizChart({ quizzes }: { quizzes: Overview['recentQuizzes'] }) {
  const { t } = useT();
  const data = [...quizzes].reverse().map((q) => ({ label: shortDate(q.completedAt), value: Math.round(q.percentage), title: q.quiz.title }));
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.charts.quiz')}</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? <Empty text={t('dashboard.charts.quizEmpty')} /> : (
          <>
            <div className="h-56" aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={tick} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} labelFormatter={(_, p) => p?.[0]?.payload?.title ?? ''} separator="" />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ul className="sr-only">{data.map((d, i) => <li key={i}>{d.title}, {d.label}: {d.value}%</li>)}</ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MasteryChart({ topics }: { topics: TopicProgress[] }) {
  const { t } = useT();
  const rows = topics.filter((p) => p.assessed).slice(0, 8).map((p) => ({ name: p.topic.title, mastery: Math.round(p.mastery), band: p.band }));
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.charts.mastery')}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? <Empty text={t('dashboard.charts.masteryEmpty')} /> : (
          <>
            <div style={{ height: Math.max(192, rows.length * 34 + 24) }} aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke={grid} />
                  <XAxis type="number" domain={[0, 100]} tick={tick} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={112} tick={tick} tickLine={false} axisLine={false} tickFormatter={(v: string) => (v.length > 15 ? `${v.slice(0, 14)}…` : v)} />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} separator="" />
                  <Bar dataKey="mastery" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {rows.map((r, i) => <Cell key={i} fill={BAND_COLOR[r.band]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="sr-only">{rows.map((r) => <li key={r.name}>{r.name}: {r.mastery}%</li>)}</ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
