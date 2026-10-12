import type { TranslateLoose } from '@/lib/i18n';
import { isApiError } from '@/lib/api/errors';

/** API xatosini foydalanuvchi tiliga o'giradi: avval `errors.<KOD>`, so'ng 5xx umumiy matni, so'ng serverning xabari. */
export function errorText(err: unknown, te: TranslateLoose): string {
  if (!isApiError(err)) return te('errors.UNKNOWN');
  const known = te(`errors.${err.code}`, '');
  if (known) return known;
  if (err.status >= 500 || err.status === 0) return te('errors.SERVER');
  return err.message || te('errors.UNKNOWN');
}

/** Maydon xato kodi (masalan PASSWORD_WEAK) uchun tarjima kaliti; noma'lum bo'lsa, umumiy "noto'g'ri". */
export function fieldErrorKey(code: string | undefined, te: TranslateLoose): string {
  const key = `errors.fields.${code}`;
  return code && te(key, '') ? key : 'validation.invalid';
}
