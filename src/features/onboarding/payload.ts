import type { MessageKey } from '@/lib/i18n';
import type { Draft, StudentProfile } from './types';

export const GRADES = Array.from({ length: 11 }, (_, i) => i + 1);
export const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export const STUDY_TIMES = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
export const DAILY_GOALS = [15, 30, 45, 60, 90] as const;
export const MAX_SUBJECTS = 10;

/** Qadam bo'yicha tekshiruv: xato bo'lsa, tarjima kaliti qaytaradi. */
export function stepError(step: number, d: Draft): MessageKey | null {
  switch (step) {
    case 0: {
      const n = d.fullName.trim().length;
      return n < 2 ? 'validation.fullName' : n > 100 ? 'validation.tooLong' : null;
    }
    case 1: return d.grade === null ? 'validation.required' : null;
    case 2: return d.subjectIds.length === 0 ? 'onboarding.subjects.required' : d.subjectIds.length > MAX_SUBJECTS ? 'validation.tooLong' : null;
    case 3: return d.goals.length > 500 ? 'validation.tooLong' : null;
    case 4: return d.dailyGoal < 10 || d.dailyGoal > 240 ? 'validation.invalid' : null;
    default: return null;
  }
}

/** PUT /students/me/onboarding tanasi (backend `forbidNonWhitelisted`: faqat DTO maydonlari). */
export function toPayload(d: Draft) {
  const goals = d.goals.trim();
  return {
    fullName: d.fullName.trim(),
    grade: d.grade,
    level: d.level,
    subjectIds: d.subjectIds,
    ...(goals && { goals }),
    dailyGoal: d.dailyGoal,
    ...(d.studyTime && { studyTime: d.studyTime }),
    preferredLanguage: 'uz',
  };
}

/** Testni o'tkazib yuborish: saqlangan profildan tana yig'iladi (sahifa yangilangan bo'lsa ham ishlaydi). */
export function skipPayload(p: StudentProfile) {
  return {
    grade: p.grade,
    level: p.level,
    subjectIds: p.subjects.map((s) => s.id),
    ...(p.goals && { goals: p.goals }),
    dailyGoal: p.dailyGoal,
    ...(p.studyTime && { studyTime: p.studyTime }),
    preferredLanguage: p.preferredLanguage || 'uz',
    skipDiagnostic: true,
  };
}
