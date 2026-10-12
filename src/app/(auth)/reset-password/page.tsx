import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';

export const metadata: Metadata = { title: 'Yangi parol' };

export default function Page() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
