import { describe, expect, it } from 'vitest';
import { formatClock, formatDuration, isBlank } from './helpers';

describe('formatClock', () => {
  it.each([[65_000, '01:05'], [0, '00:00'], [-500, '00:00'], [59_200, '01:00'], [3_725_000, '1:02:05'], [600_000, '10:00']])('%i -> %s', (ms, out) =>
    expect(formatClock(ms)).toBe(out));
});

describe('isBlank va formatDuration', () => {
  it('bo‘sh javoblar', () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank('   ')).toBe(true);
    expect(isBlank('')).toBe(true);
    expect(isBlank(0)).toBe(false);      // 0-indeksli variant javob hisoblanadi
    expect(isBlank(false)).toBe(false);  // "Noto'g'ri" javob hisoblanadi
    expect(isBlank('3')).toBe(false);
  });
  it('davomiylik', () => {
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(42)).toBe('0:42');
  });
});
