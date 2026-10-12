import { z } from 'zod';

export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
export const PHONE_RE = /^\+998\d{9}$/;

/** "90 123 45 67", "998901234567", "+998 (90) 123-45-67" -> "+998901234567". Bo'sh qiymat bo'sh qoladi. */
export function normalizePhone(raw: string): string {
  const s = raw.replace(/[^\d+]/g, '');
  if (!s) return '';
  if (s.startsWith('+')) return s;
  if (s.startsWith('998')) return `+${s}`;
  if (s.length === 9) return `+998${s}`;
  return s;
}

const password = z.string().min(8, 'validation.passwordMin').max(128, 'validation.tooLong').regex(PASSWORD_RE, 'validation.passwordWeak');
const fullName = z.string().trim().min(2, 'validation.fullName').max(100, 'validation.tooLong');
const phone = z.string().transform(normalizePhone).refine((v) => v === '' || PHONE_RE.test(v), 'validation.phone');
const email = z.string().trim().toLowerCase().email('validation.email');
const mismatch = { path: ['confirmPassword'], message: 'validation.passwordMismatch' };

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'validation.required').max(255, 'validation.tooLong'),
  password: z.string().min(1, 'validation.required').max(128, 'validation.tooLong'),
});

export const registerSchema = z.object({
  fullName,
  username: z.string().trim().toLowerCase().regex(USERNAME_RE, 'validation.username'),
  email,
  phone,
  password,
  confirmPassword: z.string(),
  role: z.enum(['STUDENT', 'TEACHER', 'PARENT']),
}).refine((d) => d.password === d.confirmPassword, mismatch);

export const forgotSchema = z.object({ email });

export const resetSchema = z.object({ password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, mismatch);

export const profileSchema = z.object({ fullName, phone });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'validation.required').max(128, 'validation.tooLong'),
  newPassword: password,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, mismatch);

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
