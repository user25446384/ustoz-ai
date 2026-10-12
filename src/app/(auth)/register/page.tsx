import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = { title: 'Ro‘yxatdan o‘tish' };

export default function Page() {
  return <Suspense><RegisterForm /></Suspense>;
}
