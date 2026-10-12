import { describe, expect, it } from 'vitest';
import { skipPayload, stepError, toPayload } from './payload';
import type { Draft, StudentProfile } from './types';

const draft: Draft = { fullName: '  Jasur Karimov ', grade: 6, level: 'BEGINNER', subjectIds: ['s1'], goals: '  ', dailyGoal: 30, studyTime: null };

describe('stepError', () => {
  it('qadamlar bo‘yicha tekshiruv', () => {
    expect(stepError(0, { ...draft, fullName: 'A' })).toBe('validation.fullName');
    expect(stepError(0, draft)).toBeNull();
    expect(stepError(1, { ...draft, grade: null })).toBe('validation.required');
    expect(stepError(2, { ...draft, subjectIds: [] })).toBe('onboarding.subjects.required');
    expect(stepError(2, { ...draft, subjectIds: Array.from({ length: 11 }, (_, i) => `s${i}`) })).toBe('validation.tooLong');
    expect(stepError(3, { ...draft, goals: 'x'.repeat(501) })).toBe('validation.tooLong');
    expect(stepError(4, { ...draft, dailyGoal: 5 })).toBe('validation.invalid');
    expect(stepError(4, { ...draft, dailyGoal: 300 })).toBe('validation.invalid');
  });
});

describe('toPayload', () => {
  it('bo‘sh ixtiyoriy maydonlar yuborilmaydi (backend forbidNonWhitelisted)', () => {
    const p = toPayload(draft);
    expect(p).toEqual({ fullName: 'Jasur Karimov', grade: 6, level: 'BEGINNER', subjectIds: ['s1'], dailyGoal: 30, preferredLanguage: 'uz' });
    expect('goals' in p).toBe(false);
    expect('studyTime' in p).toBe(false);
  });
  it('to‘ldirilgan maydonlar yuboriladi', () => {
    expect(toPayload({ ...draft, goals: ' Imtihon ', studyTime: 'EVENING' })).toMatchObject({ goals: 'Imtihon', studyTime: 'EVENING' });
  });
});

describe('skipPayload', () => {
  it('saqlangan profildan tana yig‘iladi va skipDiagnostic qo‘shiladi', () => {
    const profile: StudentProfile = {
      id: 'p', grade: 7, school: null, level: 'INTERMEDIATE', goals: null, interests: [], preferredLanguage: 'uz', studyTime: 'MORNING',
      dailyGoal: 45, onboarded: false, subjects: [{ id: 'a', name: 'Mat', slug: 'mat', icon: null, color: null }],
    };
    expect(skipPayload(profile)).toEqual({
      grade: 7, level: 'INTERMEDIATE', subjectIds: ['a'], dailyGoal: 45, studyTime: 'MORNING', preferredLanguage: 'uz', skipDiagnostic: true,
    });
  });
});
