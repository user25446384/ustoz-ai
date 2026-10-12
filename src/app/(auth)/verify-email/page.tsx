import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailView } from '@/features/auth/verify-email-view';

export const metadata: Metadata = { title: 'Emailni tasdiqlash' };

export default function Page() {
  return <Suspense><VerifyEmailView /></Suspense>;
}
