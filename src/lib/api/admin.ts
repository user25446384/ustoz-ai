import { api } from './client';

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  pendingTeachers: number;
  activeSubscriptions: number;
  revenueThisMonth: number;
  pendingReports: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: string;
}

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<{ items: AdminUserItem[]; total: number }>('/admin/users', { params }),
  updateUserStatus: (id: string, status: 'ACTIVE' | 'BLOCKED') =>
    api.patch(`/admin/users/${id}/status`, { status }),
  getPendingTeachers: () => api.get<any[]>('/admin/teachers/pending'),
  verifyTeacher: (id: string, approved: boolean, note?: string) =>
    api.post(`/admin/teachers/${id}/verify`, { approved, note }),
};
