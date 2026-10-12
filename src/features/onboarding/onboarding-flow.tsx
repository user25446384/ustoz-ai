'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { ChoiceCard } from '@/components/choice-card';
import { ErrorState } from '@/components/error-state';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import { useLogout } from '@/lib/auth/use-logout';
import { useMe } from '@/lib/auth/use-me';
import { errorText } from '@/lib/errors';
import { useT, type MessageKey } from '@/lib/i18n';
import { DiagnosticStep } from './diagnostic-step';
import { DAILY_GOALS, GRADES, LEVELS, MAX_SUBJECTS, STUDY_TIMES, stepError, toPayload } from './payload';
import { StepFrame } from './step-frame';
import type { Draft, Level, StudentProfile, StudyTime, SubjectItem } from './types';

const TOTAL = 6;
const LEVEL_KEY: Record<Level, [MessageKey, MessageKey]> = {
  BEGINNER: ['onboarding.level.beginner', 'onboarding.level.beginnerDesc'],
  INTERMEDIATE: ['onboarding.level.intermediate', 'onboarding.level.intermediateDesc'],
  ADVANCED: ['onboarding.level.advanced', 'onboarding.level.advancedDesc'],
};
const TIME_KEY: Record<StudyTime, MessageKey> = {
  MORNING: 'onboarding.time.morning', AFTERNOON: 'onboarding.time.afternoon', EVENING: 'onboarding.time.evening',
};
const PRESETS: MessageKey[] = ['onboarding.goal.exam', 'onboarding.goal.reinforce', 'onboarding.goal.newTopics', 'onboarding.goal.olympiad'];

export function OnboardingFlow() {
  const { t, te } = useT();
  const qc = useQueryClient();
  const logout = useLogout();
  const { data: me } = useMe();

  const profile = useQuery({ queryKey: ['students', 'me'], queryFn: ({ signal }) => api.get<StudentProfile>('/students/me', { signal }) });
  const subjects = useQuery({
    queryKey: ['subjects', 'all'], staleTime: 5 * 60_000,
    queryFn: ({ signal }) => api.getPage<SubjectItem>('/subjects', { params: { limit: 100 }, signal }),
  });

  const [step, setStep] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [showError, setShowError] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Birinchi yuklanishda: profil allaqachon saqlangan bo'lsa (sahifa yangilangan), to'g'ridan-to'g'ri test qadamiga
  useEffect(() => {
    if (!me || !profile.data || draft) return;
    const p = profile.data;
    setDraft({
      fullName: me.fullName, grade: p.grade, level: p.level, subjectIds: p.subjects.map((s) => s.id),
      goals: p.goals ?? '', dailyGoal: p.dailyGoal, studyTime: p.studyTime,
    });
    setStep(p.grade !== null && p.subjects.length > 0 ? 5 : 0);
  }, [me, profile.data, draft]);

  const save = useMutation({
    mutationFn: (d: Draft) => api.put<StudentProfile>('/students/me/onboarding', toPayload(d)),
    onSuccess: (p) => { qc.setQueryData(['students', 'me'], p); setSaveError(null); setStep(5); },
    onError: (e) => {
      setSaveError(errorText(e, te));
      if (isApiError(e) && e.code === 'INVALID_SUBJECTS') setStep(2);
    },
  });

  if (profile.isError) return <ErrorState message={errorText(profile.error, te)} onRetry={() => void profile.refetch()} />;
  if (step === null || !draft || !profile.data) {
    return <div className="mx-auto max-w-3xl space-y-4 p-6" aria-busy="true"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setDraft({ ...draft, [k]: v }); setShowError(false); };
  const errKey = stepError(step, draft);
  const error = showError && errKey ? te(errKey, errKey) : undefined;

  const next = (e?: FormEvent) => {
    e?.preventDefault();
    if (errKey) { setShowError(true); return; }
    setShowError(false);
    if (step === 4) save.mutate(draft);
    else setStep(step + 1);
  };
  const back = () => { setShowError(false); setSaveError(null); setStep(Math.max(0, step - 1)); };

  const toggleSubject = (id: string) => {
    const has = draft.subjectIds.includes(id);
    if (!has && draft.subjectIds.length >= MAX_SUBJECTS) return;
    set('subjectIds', has ? draft.subjectIds.filter((x) => x !== id) : [...draft.subjectIds, id]);
  };

  const nav = (label: string, loading = false) => (
    <div className="flex items-center justify-between gap-3 pt-2">
      {step > 0 ? <Button variant="ghost" onClick={back} disabled={loading}>{t('onboarding.back')}</Button> : <span />}
      <Button type="submit" size="lg" loading={loading}>{label}</Button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo href="/onboarding" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => void logout()}>{t('onboarding.exit')}</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('onboarding.stepOf', { current: step + 1, total: TOTAL })}</p>
          <div
            role="progressbar" aria-label={t('onboarding.progress')} aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step + 1}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
          </div>
        </div>

        {step === 0 && (
          <StepFrame key="s0" title={t('onboarding.name.title')} desc={t('onboarding.name.desc')}>
            <form onSubmit={next} noValidate className="space-y-4">
              <Field label={t('onboarding.name.label')} error={error}>
                {(p) => <Input {...p} value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" autoFocus={false} />}
              </Field>
              {nav(t('onboarding.next'))}
            </form>
          </StepFrame>
        )}

        {step === 1 && (
          <StepFrame key="s1" title={t('onboarding.grade.title')} desc={t('onboarding.grade.desc')}>
            <form onSubmit={next} noValidate className="space-y-6">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t('onboarding.grade.label')}</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {GRADES.map((g) => (
                    <ChoiceCard key={g} type="radio" name="grade" checked={draft.grade === g} onChange={() => set('grade', g)} title={t('onboarding.grade.option', { n: g })} />
                  ))}
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t('onboarding.grade.levelTitle')}</legend>
                <p className="text-xs text-muted-foreground">{t('onboarding.grade.levelHint')}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {LEVELS.map((l) => (
                    <ChoiceCard key={l} type="radio" name="level" checked={draft.level === l} onChange={() => set('level', l)} title={t(LEVEL_KEY[l][0])} description={t(LEVEL_KEY[l][1])} />
                  ))}
                </div>
              </fieldset>
              {nav(t('onboarding.next'))}
            </form>
          </StepFrame>
        )}

        {step === 2 && (
          <StepFrame key="s2" title={t('onboarding.subjects.title')} desc={t('onboarding.subjects.desc')}>
            <form onSubmit={next} noValidate className="space-y-4">
              {subjects.isPending && <Skeleton className="h-32 w-full" />}
              {subjects.isError && <ErrorState message={errorText(subjects.error, te)} onRetry={() => void subjects.refetch()} />}
              {subjects.isSuccess && subjects.data.items.length === 0 && <Alert variant="destructive">{t('onboarding.subjects.empty')}</Alert>}
              <fieldset className="grid gap-2 sm:grid-cols-2">
                <legend className="sr-only">{t('onboarding.subjects.title')}</legend>
                {subjects.data?.items.map((s) => (
                  <ChoiceCard
                    key={s.id} type="checkbox" checked={draft.subjectIds.includes(s.id)} onChange={() => toggleSubject(s.id)}
                    disabled={!draft.subjectIds.includes(s.id) && draft.subjectIds.length >= MAX_SUBJECTS}
                    title={<span className="flex items-center gap-2"><span aria-hidden>{s.icon ?? '📘'}</span>{s.name}</span>}
                    description={s._count ? t('onboarding.subjects.topics', { count: s._count.topics }) : s.description}
                  />
                ))}
              </fieldset>
              <p className="text-sm text-muted-foreground" aria-live="polite">{t('onboarding.subjects.selected', { count: draft.subjectIds.length })}</p>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              {saveError && <Alert variant="destructive">{saveError}</Alert>}
              {nav(t('onboarding.next'))}
            </form>
          </StepFrame>
        )}

        {step === 3 && (
          <StepFrame key="s3" title={t('onboarding.goal.title')} desc={t('onboarding.goal.desc')}>
            <form onSubmit={next} noValidate className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('onboarding.goal.presets')}</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((key) => {
                    const text = t(key);
                    return (
                      <Button key={key} variant="outline" size="sm" aria-pressed={draft.goals === text} onClick={() => set('goals', text)}>{text}</Button>
                    );
                  })}
                </div>
              </div>
              <Field label={t('onboarding.goal.label')} error={error} optional>
                {(p) => <Textarea {...p} value={draft.goals} maxLength={500} placeholder={t('onboarding.goal.placeholder')} onChange={(e) => set('goals', e.target.value)} />}
              </Field>
              {nav(t('onboarding.next'))}
            </form>
          </StepFrame>
        )}

        {step === 4 && (
          <StepFrame key="s4" title={t('onboarding.time.title')} desc={t('onboarding.time.desc')}>
            <form onSubmit={next} noValidate className="space-y-6">
              <fieldset className="space-y-2">
                <legend className="sr-only">{t('onboarding.time.title')}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {DAILY_GOALS.map((m) => (
                    <ChoiceCard key={m} type="radio" name="goal" checked={draft.dailyGoal === m} onChange={() => set('dailyGoal', m)} title={t('onboarding.time.minutes', { n: m })} />
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t('onboarding.time.when')}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STUDY_TIMES.map((s) => (
                    <ChoiceCard key={s} type="radio" name="when" checked={draft.studyTime === s} onChange={() => set('studyTime', s)} title={t(TIME_KEY[s])} />
                  ))}
                  <ChoiceCard type="radio" name="when" checked={draft.studyTime === null} onChange={() => set('studyTime', null)} title={t('onboarding.time.any')} />
                </div>
              </fieldset>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              {saveError && <Alert variant="destructive">{saveError}</Alert>}
              {nav(t('onboarding.saveAndTest'), save.isPending)}
            </form>
          </StepFrame>
        )}

        {step === 5 && <DiagnosticStep key="s5" profile={profile.data} onBack={() => setStep(4)} />}
      </main>
    </div>
  );
}
