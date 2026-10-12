import { describe, expect, it } from 'vitest';
import { goalPercent, greetingKey, recommendationHref, weekdayIndex } from './helpers';

describe('dashboard yordamchilari', () => {
  it('salomlashish soatga qarab', () => {
    expect(greetingKey(5)).toBe('dashboard.greeting.morning');
    expect(greetingKey(11)).toBe('dashboard.greeting.morning');
    expect(greetingKey(12)).toBe('dashboard.greeting.day');
    expect(greetingKey(17)).toBe('dashboard.greeting.day');
    expect(greetingKey(18)).toBe('dashboard.greeting.evening');
    expect(greetingKey(3)).toBe('dashboard.greeting.evening');
  });
  it('hafta kuni (vaqt zonasiga bog‘liq emas)', () => {
    expect(weekdayIndex('2026-09-27')).toBe(0); // yakshanba
    expect(weekdayIndex('2026-09-30')).toBe(3); // chorshanba
  });
  it('maqsad foizi 100 dan oshmaydi', () => {
    expect(goalPercent(15, 30)).toBe(50);
    expect(goalPercent(90, 30)).toBe(100);
    expect(goalPercent(10, 0)).toBe(0);
  });
  it('tavsiya havolalari', () => {
    expect(recommendationHref({ type: 'REVIEW_TOPIC', metadata: { lessonIds: ['l1', 'l2'] } })).toBe('/lessons/l1');
    expect(recommendationHref({ type: 'PRACTICE', metadata: { quizIds: ['q1'], lessonIds: ['l1'] } })).toBe('/quizzes/q1');
    expect(recommendationHref({ type: 'PRACTICE', metadata: { lessonIds: ['l1'] } })).toBe('/lessons/l1');
    expect(recommendationHref({ type: 'ADVANCED_UNLOCK', metadata: { nextTopics: [{ slug: 'ayirish', title: 'Ayirish' }] } })).toBe('/topics/ayirish');
    expect(recommendationHref({ type: 'GENERAL', metadata: null })).toBe('/progress');
    expect(recommendationHref({ type: 'REVIEW_TOPIC', metadata: null })).toBe('/learn');
  });
});
