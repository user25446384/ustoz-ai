import {
  Activity, Bot, BookOpen, CalendarCheck, ClipboardList, CreditCard, FileQuestion, GraduationCap, Layers, LayoutDashboard,
  Library, ListChecks, Medal, School, ScrollText, Settings, ShieldCheck, TrendingUp, User, Users, Wallet, Bell,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/api/types';
import type { MessageKey } from '@/lib/i18n';

export interface NavItem { href: string; label: MessageKey; icon: LucideIcon; exact?: boolean }

export const NAV: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: '/dashboard', label: 'nav.home', icon: LayoutDashboard },
    { href: '/learn', label: 'nav.learn', icon: BookOpen },
    { href: '/ai', label: 'nav.ai', icon: Bot },
    { href: '/learning-plan', label: 'nav.plan', icon: CalendarCheck },
    { href: '/progress', label: 'nav.progress', icon: TrendingUp },
    { href: '/achievements', label: 'nav.achievements', icon: Medal },
    { href: '/classes', label: 'nav.classes', icon: School },
    { href: '/assignments', label: 'nav.assignments', icon: ClipboardList },
  ],
  TEACHER: [
    { href: '/teacher', label: 'nav.teacher.panel', icon: LayoutDashboard, exact: true },
    { href: '/teacher/students', label: 'nav.teacher.students', icon: Users },
    { href: '/teacher/classes', label: 'nav.teacher.classes', icon: School },
    { href: '/teacher/lessons', label: 'nav.teacher.lessons', icon: BookOpen },
    { href: '/teacher/quizzes', label: 'nav.teacher.quizzes', icon: FileQuestion },
    { href: '/teacher/assignments', label: 'nav.teacher.assignments', icon: ClipboardList },
    { href: '/teacher/analytics', label: 'nav.teacher.analytics', icon: Activity },
  ],
  PARENT: [
    { href: '/parent', label: 'nav.parent.panel', icon: LayoutDashboard, exact: true },
    { href: '/parent/children', label: 'nav.parent.children', icon: Users },
    { href: '/parent/progress', label: 'nav.parent.progress', icon: TrendingUp },
    { href: '/parent/analytics', label: 'nav.parent.analytics', icon: Activity },
  ],
  ADMIN: [
    { href: '/admin', label: 'nav.admin.panel', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'nav.admin.users', icon: Users },
    { href: '/admin/students', label: 'nav.admin.students', icon: GraduationCap },
    { href: '/admin/teachers', label: 'nav.admin.teachers', icon: ShieldCheck },
    { href: '/admin/subjects', label: 'nav.admin.subjects', icon: Library },
    { href: '/admin/topics', label: 'nav.admin.topics', icon: Layers },
    { href: '/admin/lessons', label: 'nav.admin.lessons', icon: BookOpen },
    { href: '/admin/quizzes', label: 'nav.admin.quizzes', icon: ListChecks },
    { href: '/admin/questions', label: 'nav.admin.questions', icon: FileQuestion },
    { href: '/admin/subscriptions', label: 'nav.admin.subscriptions', icon: CreditCard },
    { href: '/admin/payments', label: 'nav.admin.payments', icon: Wallet },
    { href: '/admin/analytics', label: 'nav.admin.analytics', icon: Activity },
    { href: '/admin/settings', label: 'nav.admin.settings', icon: Settings },
    { href: '/admin/audit-logs', label: 'nav.admin.audit', icon: ScrollText },
  ],
};

/** Hamma rollarga umumiy pastki bo'lim. */
export const SECONDARY: NavItem[] = [
  { href: '/notifications', label: 'nav.notifications', icon: Bell },
  { href: '/subscription', label: 'nav.subscription', icon: CreditCard },
  { href: '/settings', label: 'nav.settings', icon: Settings },
];

/** Talabalar uchun mobil pastki navigatsiya (talab bo'yicha: Home, Learn, AI, Progress, Profile). */
export const MOBILE_STUDENT: NavItem[] = [
  { href: '/dashboard', label: 'nav.home', icon: LayoutDashboard },
  { href: '/learn', label: 'nav.learn', icon: BookOpen },
  { href: '/ai', label: 'nav.ai', icon: Bot },
  { href: '/progress', label: 'nav.progress', icon: TrendingUp },
  { href: '/settings', label: 'nav.profile', icon: User }, // /profile sahifasi keyin; hozircha profil sozlamalarda
];

export const isActive = (pathname: string, item: NavItem) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
