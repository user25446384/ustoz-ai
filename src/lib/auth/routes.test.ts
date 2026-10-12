import { describe, expect, it } from 'vitest';
import { homePath, isAuthPath, requiredRole, safeNext } from './routes';

describe('safeNext (open redirect himoyasi)', () => {
  it('ichki yo‘llarga ruxsat', () => {
    expect(safeNext('/dashboard')).toBe('/dashboard');
    expect(safeNext('/lessons/abc?x=1#h')).toBe('/lessons/abc?x=1#h');
  });
  it.each([
    ['//evil.com'], ['/\\evil.com'], ['https://evil.com'], ['javascript:alert(1)'], ['evil.com'], ['/ok\n/x'], ['/login'], ['/register?x=1'], [''], [null], [undefined],
  ])('%s rad etiladi', (v) => expect(safeNext(v as string | null)).toBeNull());
});

describe('homePath', () => {
  it('rolga qarab', () => {
    expect(homePath({ role: 'ADMIN', student: null })).toBe('/admin');
    expect(homePath({ role: 'TEACHER', student: null })).toBe('/teacher');
    expect(homePath({ role: 'PARENT', student: null })).toBe('/parent');
    expect(homePath({ role: 'STUDENT', student: { onboarded: true } })).toBe('/dashboard');
    expect(homePath({ role: 'STUDENT', student: { onboarded: false } })).toBe('/onboarding');
  });
});

describe('requiredRole va isAuthPath', () => {
  it('panel yo‘llari', () => {
    expect(requiredRole('/teacher')).toBe('TEACHER');
    expect(requiredRole('/teacher/classes')).toBe('TEACHER');
    expect(requiredRole('/admin/users')).toBe('ADMIN');
    expect(requiredRole('/parent/children')).toBe('PARENT');
    expect(requiredRole('/teachers-lounge')).toBeNull(); // prefiks emas, to'liq segment
    expect(requiredRole('/dashboard')).toBeNull();
  });
  it('auth sahifalari', () => {
    expect(isAuthPath('/login')).toBe(true);
    expect(isAuthPath('/verify-email')).toBe(true);
    expect(isAuthPath('/dashboard')).toBe(false);
  });
});
