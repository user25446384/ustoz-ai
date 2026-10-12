import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Parolni tiklash' };

export default function Page() {
  return <ForgotPasswordForm />;
}
