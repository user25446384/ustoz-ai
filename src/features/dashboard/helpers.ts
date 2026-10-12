import type { Band, Recommendation } from './types';

export type GreetingKey = 'dashboard.greeting.morning' | 'dashboard.greeting.day' | 'dashboard.greeting.evening';

export function greetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return 'dashboard.greeting.morning';
  if (hour >= 12 && hour < 18) return 'dashboard.greeting.day';
  return 'dashboard.greeting.evening';
}

/** "2026-09-30" -> 0..6 (yakshanba = 0). Vaqt zonasiga bog'liq emas. */
export const weekdayIndex = (dateKey: string) => new Date(`${dateKey}T00:00:00Z`).getUTCDay();

export const goalPercent = (done: number, goal: number) => (goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0);

export const BAND_COLOR: Record<Band, string> = {
  WEAK: 'hsl(var(--destructive))', PRACTICE: 'hsl(var(--primary))', STRONG: 'hsl(var(--success))', NOT_ASSESSED: 'hsl(var(--muted-foreground))',
};

export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** Tavsiya turiga qarab qayerga olib borish. */
export function recommendationHref(r: Pick<Recommendation, 'type' | 'metadata'>): string {
  const m = r.metadata ?? {};
  switch (r.type) {
    case 'REVIEW_TOPIC': return m.lessonIds?.[0] ? `/lessons/${m.lessonIds[0]}` : '/learn';
    case 'PRACTICE': return m.quizIds?.[0] ? `/quizzes/${m.quizIds[0]}` : m.lessonIds?.[0] ? `/lessons/${m.lessonIds[0]}` : '/learn';
    case 'ADVANCED_UNLOCK': return m.nextTopics?.[0] ? `/topics/${m.nextTopics[0].slug}` : '/learn';
    default: return '/progress';
  }
}
