'use client';

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChoiceCard } from '@/components/choice-card';
import { Markdown } from '@/components/markdown';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { formatClock, isBlank } from './helpers';
import type { AnswerValue, AttemptQuestion, InProgressAttempt, QuizResult } from './types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const TEXT_TYPES = new Set(['FILL_BLANK', 'SHORT_ANSWER']);

function SaveIndicator({ state }: { state: SaveState }) {
  const { t } = useT();
  if (state === 'idle') return null;
  const text = state === 'saving' ? t('quiz.save.saving') : state === 'saved' ? t('quiz.save.saved') : t('quiz.save.error');
  return (
    <span role="status" className={cn('text-xs', state === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{text}</span>
  );
}

export function QuizRunner({ attempt, onSubmitted }: { attempt: InProgressAttempt; onSubmitted: (r: QuizResult) => void }) {
  const { t, te } = useT();
  const questions = attempt.questions;
  const total = questions.length;

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => ({ ...attempt.draft }));
  const [index, setIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const pending = useRef<Record<string, AnswerValue | null>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const submittingRef = useRef(false);
  const autoTried = useRef(false);
  const submitRef = useRef<(auto?: boolean) => Promise<void>>(async () => undefined);

  // Taymer server vaqtiga moslanadi: foydalanuvchi soatini o'zgartirib vaqtni cho'za olmaydi
  const [offset] = useState(() => Date.parse(attempt.serverTime) - Date.now());
  const deadline = attempt.deadline ? Date.parse(attempt.deadline) : null;
  const [remaining, setRemaining] = useState<number | null>(() => (deadline === null ? null : deadline - (Date.now() + offset)));

  useEffect(() => {
    if (deadline === null) return;
    const tick = () => setRemaining(deadline - (Date.now() + offset));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, offset]);

  const flush = useCallback(async () => {
    clearTimeout(saveTimer.current);
    const batch = pending.current;
    if (Object.keys(batch).length === 0 || submittingRef.current) return;
    pending.current = {};
    try {
      await api.put(`/quiz-attempts/${attempt.attemptId}/answers`, { answers: batch });
      setSaveState(Object.keys(pending.current).length ? 'saving' : 'saved');
    } catch (err) {
      pending.current = { ...batch, ...pending.current }; // yuborilmaganlar qaytariladi, keyingi urinishda ketadi
      if (isApiError(err) && (err.code === 'ATTEMPT_EXPIRED' || err.code === 'ATTEMPT_COMPLETED')) {
        void submitRef.current(true);
        return;
      }
      setSaveState('error');
    }
  }, [attempt.attemptId]);

  const schedule = (delay: number) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flush(), delay);
  };

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') void flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); clearTimeout(saveTimer.current); };
  }, [flush]);

  const setAnswer = (q: AttemptQuestion, value: AnswerValue) => {
    const blank = isBlank(value);
    setAnswers((prev) => {
      const next = { ...prev };
      if (blank) delete next[q.id]; else next[q.id] = value;
      return next;
    });
    pending.current[q.id] = blank ? null : value; // null: qoralamadan o'chiriladi
    setSaveState('saving');
    schedule(TEXT_TYPES.has(q.type) ? 800 : 300);
  };

  const submit = useCallback(async (auto = false) => {
    if (submittingRef.current) return;
    const unanswered = total - Object.keys(answersRef.current).length;
    if (!auto && unanswered > 0 && !window.confirm(t('quiz.confirmSubmit', { count: unanswered }))) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    clearTimeout(saveTimer.current);
    try {
      onSubmitted(await api.post<QuizResult>(`/quiz-attempts/${attempt.attemptId}/submit`, { answers: answersRef.current }));
    } catch (err) {
      submittingRef.current = false;
      setSubmitting(false);
      setError(errorText(err, te)); // javoblar saqlanib qoladi, "Qayta urinish" bilan yuboriladi
    }
  }, [attempt.attemptId, onSubmitted, t, te, total]);
  submitRef.current = submit;

  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !autoTried.current) {
      autoTried.current = true; // faqat bir marta: xato bo'lsa, foydalanuvchi qayta urinadi (so'rovlar yog'ilmasligi uchun)
      void submitRef.current(true);
    }
  }, [remaining]);

  const q = questions[index];
  const answered = Object.keys(answers).length;
  const current = answers[q.id];
  const low = remaining !== null && remaining > 0 && remaining <= 60_000;
  const last = index === total - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{attempt.quiz.title}</h2>
          <p className="text-sm text-muted-foreground">{t('quiz.answered', { count: answered, total })}</p>
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} />
          {remaining !== null && (
            <div role="timer" className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm tabular-nums', low && 'border-destructive text-destructive')}>
              <Clock className="size-4" aria-hidden />
              <span className="sr-only">{t('quiz.timeLeft')}: </span>
              {formatClock(remaining)}
            </div>
          )}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answered / total) * 100}%` }} />
      </div>

      {low && <Alert variant="destructive">{t('quiz.timeWarning')}</Alert>}
      {remaining !== null && remaining <= 0 && <Alert>{t('quiz.timeUp')}</Alert>}
      {error && (
        <Alert variant="destructive" action={<Button size="sm" variant="outline" onClick={() => void submit(true)}>{t('common.retry')}</Button>}>
          {error}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <fieldset key={q.id} className="space-y-4">
              <legend className="text-xs text-muted-foreground">
                {t('quiz.question', { current: index + 1, total })} · {t('quiz.points', { count: q.points })}
              </legend>
              <div className="text-lg font-medium"><Markdown>{q.question}</Markdown></div>

              {q.type === 'MULTIPLE_CHOICE' && (
                <div className="grid gap-2">
                  {(q.options ?? []).map((opt, i) => (
                    <ChoiceCard
                      key={i} type="radio" name={`q-${q.id}`} checked={current === i}
                      onChange={() => setAnswer(q, i)} title={<Markdown inline>{opt}</Markdown>}
                    />
                  ))}
                </div>
              )}

              {q.type === 'TRUE_FALSE' && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <ChoiceCard type="radio" name={`q-${q.id}`} checked={current === true} onChange={() => setAnswer(q, true)} title={t('quiz.true')} />
                  <ChoiceCard type="radio" name={`q-${q.id}`} checked={current === false} onChange={() => setAnswer(q, false)} title={t('quiz.false')} />
                </div>
              )}

              {q.type === 'FILL_BLANK' && (
                <Input
                  aria-label={q.question} value={typeof current === 'string' ? current : ''} maxLength={200}
                  placeholder={t('quiz.fillPlaceholder')} autoComplete="off" autoCapitalize="none" spellCheck={false}
                  onChange={(e) => setAnswer(q, e.target.value)}
                />
              )}

              {q.type === 'SHORT_ANSWER' && (
                <Textarea
                  aria-label={q.question} value={typeof current === 'string' ? current : ''} maxLength={500}
                  placeholder={t('quiz.shortPlaceholder')} onChange={(e) => setAnswer(q, e.target.value)}
                />
              )}
            </fieldset>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                <ChevronLeft aria-hidden />{t('quiz.prev')}
              </Button>
              {last ? (
                <Button loading={submitting} onClick={() => void submit()}>{t('quiz.finish')}</Button>
              ) : (
                <Button onClick={() => setIndex((i) => i + 1)}>{t('quiz.next')}<ChevronRight aria-hidden /></Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">{t('quiz.navigation')}</p>
            <ol className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-4">
              {questions.map((x, i) => (
                <li key={x.id}>
                  <button
                    type="button" onClick={() => setIndex(i)} aria-label={t('quiz.goTo', { n: i + 1 })}
                    aria-current={i === index ? 'step' : undefined}
                    className={cn(
                      'h-9 w-full rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      answers[x.id] !== undefined ? 'border-primary/40 bg-primary/15 text-primary-strong' : 'bg-card hover:bg-accent',
                      i === index && 'ring-2 ring-primary',
                    )}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
