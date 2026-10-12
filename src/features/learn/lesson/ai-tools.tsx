'use client';

import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Markdown } from '@/components/markdown';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Flashcard { front: string; back: string }

export function AiLessonTools({ lessonId }: { lessonId: string }) {
  const { t, te } = useT();
  const [view, setView] = useState<'summary' | 'cards'>('summary');
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const summary = useMutation({ mutationFn: () => api.post<{ summary: string }>(`/ai/lessons/${lessonId}/summary`) });
  const cards = useMutation({ mutationFn: () => api.post<{ cards: Flashcard[] }>(`/ai/lessons/${lessonId}/flashcards`) });

  const open = (v: 'summary' | 'cards') => {
    setView(v);
    if (v === 'summary' && !summary.data && !summary.isPending) summary.mutate();
    if (v === 'cards' && !cards.data && !cards.isPending) cards.mutate();
  };
  const active = view === 'summary' ? summary : cards;
  const started = summary.isPending || summary.isSuccess || summary.isError || cards.isPending || cards.isSuccess || cards.isError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-secondary" aria-hidden />{t('lesson.ai.title')}</CardTitle>
        <CardDescription>{t('lesson.ai.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={started && view === 'summary' ? 'default' : 'outline'} aria-pressed={started && view === 'summary'} loading={summary.isPending} onClick={() => open('summary')}>{t('lesson.ai.summary')}</Button>
          <Button size="sm" variant={started && view === 'cards' ? 'default' : 'outline'} aria-pressed={started && view === 'cards'} loading={cards.isPending} onClick={() => open('cards')}>{t('lesson.ai.flashcards')}</Button>
        </div>
        {started && active.isError && <Alert variant="destructive" action={<Button size="sm" variant="outline" onClick={() => active.mutate()}>{t('common.retry')}</Button>}>{errorText(active.error, te)}</Alert>}
        {started && active.isPending && <p role="status" className="text-sm text-muted-foreground">{t('lesson.ai.generating')}</p>}

        {view === 'summary' && summary.data && <Markdown className="rounded-xl bg-muted/40 p-4 text-sm">{summary.data.summary}</Markdown>}

        {view === 'cards' && cards.data && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('lesson.ai.hint')}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {cards.data.cards.map((c, i) => {
                const back = flipped.has(i);
                return (
                  <li key={i}>
                    <button
                      type="button" aria-pressed={back}
                      onClick={() => setFlipped((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                      className={cn(
                        'flex min-h-28 w-full flex-col justify-between gap-2 rounded-xl border p-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        back ? 'border-success/50 bg-success/10' : 'bg-card hover:bg-accent',
                      )}
                    >
                      <span className="text-xs font-medium text-muted-foreground">{back ? t('lesson.ai.back') : t('lesson.ai.front')}</span>
                      <span className="font-medium"><Markdown inline>{back ? c.back : c.front}</Markdown></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
