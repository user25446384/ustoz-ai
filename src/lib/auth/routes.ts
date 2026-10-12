import type { Me, Role } from '@/lib/api/types';

export const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'] as const;
export const isAuthPath = (p: string) => AUTH_PATHS.some((a) => p === a || p.startsWith(`${a}/`));

export function homePath(me: Pick<Me, 'role' | 'student'>): string {
  switch (me.role) {
    case 'ADMIN': return '/admin';
    case 'TEACHER': return '/teacher';
    case 'PARENT': return '/parent';
    default: return me.student && !me.student.onboarded ? '/onboarding' : '/dashboard';
  }
}

/** Faqat shu saytning ichki yo'liga ruxsat (open redirect'ga qarshi). Auth sahifalariga qaytarmaydi. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  if (/[\u0000-\u001f]/.test(next) || isAuthPath(next.split(/[?#]/)[0])) return null;
  return next;
}

const PANELS: [string, Role][] = [['/teacher', 'TEACHER'], ['/parent', 'PARENT'], ['/admin', 'ADMIN']];

/** Panel yo'llari uchun majburiy rol (qolgan sahifalar hamma uchun). */
export function requiredRole(pathname: string): Role | null {
  return PANELS.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1] ?? null;
}
