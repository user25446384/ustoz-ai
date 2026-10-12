'use client';

import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Markdown } from '@/components/markdown';
import { ProgressRing } from '@/components/progress-ring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT, type MessageKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { formatDuration } from './helpers';
import type { QuizResult, ReviewItem, TopicLevel } from './types';

const LEVEL_KEY: Record<TopicLevel, MessageKey> = { WEAK: 'quiz.level.weak', PRACTICE: 'quiz.level.practice', STRONG: 'quiz.level.strong' };
const LEVEL_STYLE: Record<TopicLevel, string> = {
  WEAK: 'bg-destructive/15 text-destructive',
  PRACTICE: 'bg-primary/15 text-primary-strong',
  STRONG: 'bg-success/15 text-success-strong',
};

function Answer({ item, value }: { item: ReviewItem; value: unknown }) {
  const { t } = useT();
  if (value === null || value === undefined) return <span className="text-muted-foreground">{t('quiz.result.noAnswer')}</span>;
  if (item.type === 'MULTIPLE_CHOICE') {
    const opt = typeof value === 'number' ? item.options?.[value] : undefined;
    return opt ? <Markdown inline>{opt}</Markdown> : <>—</>;
  }
  if (item.type === 'TRUE_FALSE') return <>{value === true ? t('quiz.true') : t('quiz.false')}</>;
  return <>{Array.isArray(value) ? value.join(' / ') : String(value)}</>;
}

export function QuizResultView({ result, actions }: { result: QuizResult; actions?: ReactNode }) {
  const { t } = useT();
  const { attempt, topics, review, rewards } = result;
  const pct = attempt.percentage;
  const color = pct >= 80 ? 'hsl(var(--success))' : pct >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
  const headline = pct >= 80 ? t('quiz.result.great') : pct >= 50 ? t('quiz.result.good') : t('quiz.result.keepGoing');
  const hasRewards = rewards.xp > 0 || rewards.streakBonusToday > 0 || rewards.achievements.length > 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
          <ProgressRing value={pct} size={128} stroke={12} color={color} label={`${Math.round(pct)}%`}>
            <span className="text-2xl font-bold">{Math.round(pct)}%</span>
          </ProgressRing>
          <div className="space-y-3 text-center sm:text-left">
            <div>
              <h2 className="text-xl font-bold">{headline}</h2>
              <p className="text-sm text-muted-foreground">{t('quiz.result.score', { score: attempt.score, max: attempt.maxScore })}</p>
            </div>
            <dl className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm sm:justify-start">
              <div><dt className="text-muted-foreground">{t('quiz.result.correct')}</dt><dd className="font-semibold text-success-strong">{attempt.correct}</dd></div>
              <div><dt className="text-muted-foreground">{t('quiz.result.wrong')}</dt><dd className="font-semibold text-destructive">{attempt.wrong}</dd></div>
              <div><dt className="text-muted-foreground">{t('quiz.result.unanswered')}</dt><dd className="font-semibold">{attempt.unanswered}</dd></div>
              {attempt.durationSec !== null && (
                <div><dt className="text-muted-foreground">{t('quiz.result.time')}</dt><dd className="font-semibold tabular-nums">{formatDuration(attempt.durationSec)}</dd></div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>

      {hasRewards && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader><CardTitle>{t('quiz.result.rewards')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {rewards.xp > 0 && (
                <span className="animate-in zoom-in-50 rounded-xl bg-primary px-3 py-1.5 text-lg font-bold text-primary-foreground duration-500">
                  {t('quiz.result.xp', { count: rewards.xp })}
                </span>
              )}
              {rewards.streakBonusToday > 0 && (
                <span className="rounded-xl bg-success/15 px-3 py-1.5 text-sm font-medium text-success-strong">
                  🔥 {t('quiz.result.streakBonus')}: {t('quiz.result.xp', { count: rewards.streakBonusToday })}
                </span>
              )}
              <span className="text-sm text-muted-foreground">{t('quiz.result.level', { level: rewards.level })} · {rewards.totalXp} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={rewards.progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${rewards.progressPct}%` }} />
            </div>
            {rewards.achievements.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {rewards.achievements.map((a) => (
                  <li key={a.code} className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 rounded-xl border bg-card p-3 duration-500">
                    <span className="text-2xl" aria-hidden>{a.icon ?? '🏆'}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{t('quiz.result.newAchievement')}</p>
                      <p className="truncate text-sm font-semibold">{a.name}</p>
                    </div>
                    <span className="ml-auto text-sm font-medium text-primary-strong">{t('quiz.result.xp', { count: a.xpReward })}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {topics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t('quiz.result.topics')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topics.map((tp) => (
                <li key={tp.topicId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium">{tp.title ?? '—'}</span>
                    <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', LEVEL_STYLE[tp.level])}>{t(LEVEL_KEY[tp.level])}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${tp.percentage}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{tp.correct} / {tp.total} · {Math.round(tp.percentage)}%</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{t('quiz.result.review')}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {review.map((item, i) => {
            const unanswered = item.yourAnswer === null;
            const Icon = item.isCorrect ? CheckCircle2 : unanswered ? MinusCircle : XCircle;
            return (
              <details key={item.questionId} className="group rounded-xl border bg-card">
                <summary className="flex cursor-pointer list-none items-start gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <Icon className={cn('mt-0.5 size-5 shrink-0', item.isCorrect ? 'text-success' : unanswered ? 'text-muted-foreground' : 'text-destructive')} aria-hidden />
                  <span className="sr-only">{item.isCorrect ? t('quiz.result.correct') : unanswered ? t('quiz.result.unanswered') : t('quiz.result.wrong')}</span>
                  <span className="min-w-0 flex-1 text-sm font-medium"><span className="text-muted-foreground">{i + 1}. </span><Markdown inline>{item.question}</Markdown></span>
                </summary>
                <div className="space-y-2 border-t p-3 text-sm">
                  <p><span className="text-muted-foreground">{t('quiz.result.yourAnswer')}: </span><Answer item={item} value={item.yourAnswer} /></p>
                  {!item.isCorrect && (
                    <p><span className="text-muted-foreground">{t('quiz.result.correctAnswer')}: </span><span className="font-medium text-success-strong"><Answer item={item} value={item.correctAnswer} /></span></p>
                  )}
                  {item.aiFeedback && <p className="rounded-lg bg-muted p-2">{item.aiFeedback}</p>}
                  {item.explanation && (
                    <div className="rounded-lg bg-primary/5 p-2"><p className="text-xs font-medium text-primary-strong">{t('quiz.result.explanation')}</p><Markdown inline>{item.explanation}</Markdown></div>
                  )}
                </div>
              </details>
            );
          })}
        </CardContent>
      </Card>

      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
