export type Role = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';

export interface ApiMeta { page?: number; limit?: number; total?: number; totalPages?: number; [k: string]: unknown }
export interface ApiSuccess<T> { success: true; data: T; message: string; meta: ApiMeta }
export interface ApiFailure { success: false; error: { code: string; message: string; details?: Record<string, unknown> } }
export interface Page<T> { items: T[]; meta: ApiMeta }

export interface Me {
  id: string; fullName: string; username: string; email: string; phone: string | null; avatar: string | null;
  role: Role; status: string; emailVerified: boolean; locale: string; theme: 'light' | 'dark' | 'system'; createdAt: string;
  student: { onboarded: boolean } | null;
}

export interface PublicSettings {
  registrationEnabled: boolean; paymentsEnabled: boolean; aiEnabled: boolean;
  maintenance: { enabled: boolean; message: string | null };
}
