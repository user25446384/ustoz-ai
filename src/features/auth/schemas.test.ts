import { describe, expect, it } from 'vitest';
import { changePasswordSchema, normalizePhone, registerSchema, resetSchema } from './schemas';

const valid = {
  fullName: ' Jasur Karimov ', username: 'Jasur_01', email: ' JASUR@Test.UZ ', phone: '90 123 45 67',
  password: 'Parol123', confirmPassword: 'Parol123', role: 'STUDENT' as const,
};
const msgs = (r: ReturnType<typeof registerSchema.safeParse>) => (r.success ? [] : r.error.issues.map((i) => i.message));

describe('normalizePhone', () => {
  it.each([
    ['90 123 45 67', '+998901234567'], ['998901234567', '+998901234567'], ['+998 (90) 123-45-67', '+998901234567'],
    ['+998901234567', '+998901234567'], ['', ''], ['12345', '12345'],
  ])('%s -> %s', (i, o) => expect(normalizePhone(i)).toBe(o));
});

describe('registerSchema', () => {
  it('to‘g‘ri ma’lumot normallashtiriladi', () => {
    const r = registerSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ fullName: 'Jasur Karimov', username: 'jasur_01', email: 'jasur@test.uz', phone: '+998901234567' });
  });
  it('telefon ixtiyoriy', () => expect(registerSchema.safeParse({ ...valid, phone: '' }).success).toBe(true));
  it('noto‘g‘ri maydonlar uchun tarjima kalitlari qaytadi', () => {
    expect(msgs(registerSchema.safeParse({ ...valid, password: 'abcdefgh', confirmPassword: 'abcdefgh' }))).toContain('validation.passwordWeak');
    expect(msgs(registerSchema.safeParse({ ...valid, password: 'Ab1', confirmPassword: 'Ab1' }))).toContain('validation.passwordMin');
    expect(msgs(registerSchema.safeParse({ ...valid, username: 'a b' }))).toContain('validation.username');
    expect(msgs(registerSchema.safeParse({ ...valid, email: 'yoq' }))).toContain('validation.email');
    expect(msgs(registerSchema.safeParse({ ...valid, phone: '12345' }))).toContain('validation.phone');
    expect(msgs(registerSchema.safeParse({ ...valid, confirmPassword: 'Boshqa123' }))).toContain('validation.passwordMismatch');
  });
  it('ADMIN roli qabul qilinmaydi', () => {
    expect(registerSchema.safeParse({ ...valid, role: 'ADMIN' }).success).toBe(false);
  });
});

describe('parol almashtirish sxemalari', () => {
  it('reset: mos kelmasa xato', () => {
    expect(resetSchema.safeParse({ password: 'Parol123', confirmPassword: 'x' }).success).toBe(false);
    expect(resetSchema.safeParse({ password: 'Parol123', confirmPassword: 'Parol123' }).success).toBe(true);
  });
  it('change: yangi parol qoidalari', () => {
    expect(changePasswordSchema.safeParse({ currentPassword: 'x', newPassword: 'zaifparol', confirmPassword: 'zaifparol' }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: 'x', newPassword: 'Yangi1234', confirmPassword: 'Yangi1234' }).success).toBe(true);
  });
});
