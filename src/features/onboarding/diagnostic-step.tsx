'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/error-state';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizResultView } from '@/features/quiz/quiz-result';
import { QuizRunner } from '@/features/quiz/quiz-runner';
import type { InProgressAttempt, QuizResult } from '@/features/quiz/types';
import { api } from '@/lib/api/client';
import type { Me } from '@/lib/api/types';
import { meKey } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT, type MessageKey } from '@/lib/i18n';
import { skipPayload } from './payload';
import { StepFrame } from './step-frame';
import type { Level, QuizListItem, StudentProfile } from './types';

const LEVEL_KEY: Record<Level, MessageKey> = {
  BEGINNER: 'onboarding.level.beginner', INTERMEDIATE: 'onboarding.level.intermediate', ADVANCED: 'onboarding.level.advanced',
};

export function DiagnosticStep({ profile, onBack }: { profile: StudentProfile; onBack: () => void }) {
  const { t, te } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [attempt, setAttempt] = useState<InProgressAttempt | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const subjectIds = useMemo(() => new Set(profile.subjects.map((s) => s.id)), [profile.subjects]);
  const quizzes = useQuery({
    queryKey: ['quizzes', 'diagnostic'],
    queryFn: ({ signal }) => api.getPage<QuizListItem>('/quizzes', { params: { isDiagnostic: true, limit: 100 }, signal }),
  });
  const available = (quizzes.data?.items ?? []).filter((q) => subjectIds.has(q.topic.subject.id));

  const start = useMutation({
    mutationFn: (quizId: string) => api.post<InProgressAttempt>('/quiz-attempts', { quizId }), // ochiq urinish bo'lsa, davom ettiradi
    onSuccess: (a) => { setError(null); setAttempt(a); },
    onError: (e) => setError(errorText(e, te)),
  });

  /** skip=true: testsiz yakunlash (server onboarded=true qiladi). Keshdagi `me` shundan keyin yangilanadi. */
  async function complete(skip: boolean) {
    setError(null);
    setBusy(true);
    try {
      if (skip) await api.put('/students/me/onboarding', skipPayload(profile));
      qc.setQueryData<Me>(meKey, (m) => (m?.student ? { ...m, student: { ...m.student, onboarded: true } } : m));
      router.replace('/dashboard');
    } catch (e) {
      setError(errorText(e, te));
      setBusy(false);
    }
  }

  if (attempt && !result) {
    return (
      <QuizRunner
        attempt={attempt}
        onSubmitted={(r) => {
          setResult(r);
          setAttempt(null);
          void qc.invalidateQueries({ queryKey: ['students', 'me'] }); // yangi boshlang'ich daraja
        }}
      />
    );
  }

  if (result) {
    return (
      <StepFrame title={t('onboarding.diagnostic.resultTitle')}>
        <Alert variant="success">{t('onboarding.diagnostic.yourLevel')}: <strong>{t(LEVEL_KEY[profile.level])}</strong></Alert>
        {error && <Alert variant="destructive">{error}</Alert>}
        <QuizResultView
          result={result}
          actions={<Button size="lg" loading={busy} onClick={() => void complete(false)}>{t('onboarding.diagnostic.toDashboard')}</Button>}
        />
      </StepFrame>
    );
  }

  return (
    <StepFrame title={t('onboarding.diagnostic.title')} desc={t('onboarding.diagnostic.desc')}>
      {error && <Alert variant="destructive">{error}</Alert>}
      {quizzes.isPending && <Skeleton className="h-28 w-full" aria-label={t('onboarding.diagnostic.loading')} />}
      {quizzes.isError && <ErrorState message={errorText(quizzes.error, te)} onRetry={() => void quizzes.refetch()} />}

      {quizzes.isSuccess && available.length === 0 && (
        <div className="space-y-4">
          <Alert>{t('onboarding.diagnostic.none')}</Alert>
          <Button size="lg" loading={busy} onClick={() => void complete(true)}>{t('onboarding.diagnostic.toDashboard')}</Button>
        </div>
      )}

      {available.length > 0 && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {available.map((q) => (
              <li key={q.id}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div>
                      <p className="text-xs font-medium text-primary-strong">{q.topic.subject.name}</p>
                      <p className="font-semibold">{q.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('onboarding.diagnostic.questions', { count: q._count.questions })}
                        {q.duration ? ` · ${t('onboarding.diagnostic.duration', { count: q.duration })}` : ''}
                      </p>
                    </div>
                    <Button className="mt-auto" loading={start.isPending && start.variables === q.id} disabled={busy} onClick={() => start.mutate(q.id)}>
                      {t('onboarding.diagnostic.start')}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button variant="ghost" onClick={onBack} disabled={busy}>{t('onboarding.back')}</Button>
            <div className="text-right">
              <Button variant="outline" loading={busy} onClick={() => void complete(true)}>{t('onboarding.diagnostic.skip')}</Button>
              <p className="mt-1 text-xs text-muted-foreground">{t('onboarding.diagnostic.skipHint')}</p>
            </div>
          </div>
        </>
      )}
    </StepFrame>
  );
}
