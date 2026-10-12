import type { Difficulty } from '@/components/difficulty-badge';
import type { Band } from '@/features/dashboard/types';
import type { Rewards } from '@/features/quiz/types';

export type { Difficulty };

export interface SubjectListItem {
  id: string; name: string; slug: string; description: string | null; icon: string | null; color: string | null; _count?: { topics: number };
}
export interface PlainSubject {
  id: string; name: string; slug: string; description: string | null; icon: string | null; color: string | null; isActive: boolean;
  topics: { id: string; title: string; slug: string; description: string | null; order: number; _count: { children: number; lessons: number } }[];
}
export interface RoadmapTopic {
  id: string; title: string; slug: string; parentTopicId: string | null; order: number;
  mastery: number; assessed: boolean; band: Band; lessons: { total: number; completed: number }; unlocked: boolean;
}
export interface Roadmap { subject: { id: string; name: string; slug: string; color: string | null }; topics: RoadmapTopic[] }

export interface TopicDetail {
  id: string; title: string; slug: string; description: string | null;
  subject: { id: string; name: string; slug: string; isActive: boolean };
  parent: { id: string; title: string; slug: string } | null;
  children: { id: string; title: string; slug: string; description: string | null }[];
}
export interface LessonListItem {
  id: string; title: string; description: string | null; difficulty: Difficulty; estimatedMinutes: number; order: number;
  isPublished: boolean; topicId: string; completed: boolean;
}
export interface Attachment { id: string; name: string; mimeType: string; size: number; url: string }
export interface LessonNav { id: string; title: string; estimatedMinutes: number }
export interface LessonDetail {
  id: string; topicId: string; title: string; description: string | null; content: string; difficulty: Difficulty;
  estimatedMinutes: number; isPublished: boolean;
  breadcrumb: { subject: { id: string; name: string; slug: string }; topic: { id: string; title: string; slug: string } };
  attachments: Attachment[]; prev: LessonNav | null; next: LessonNav | null; completed: boolean; saved: boolean;
}
export interface Note { id: string; content: string; createdAt: string }
export interface CompleteResult { completed: boolean; alreadyCompleted: boolean; rewards: Rewards | null }

export interface QuizMeta {
  id: string; title: string; description: string | null; duration: number | null; difficulty: Difficulty;
  isPublished: boolean; isDiagnostic: boolean; questionCount: number;
  topic: { id: string; title: string; slug: string; subject: { id: string; name: string; slug: string } };
}
export interface AttemptListItem {
  id: string; quizId: string; score: number; maxScore: number; percentage: number; startedAt: string; completedAt: string | null;
  quiz: { title: string; isDiagnostic: boolean; topic: { title: string; slug: string } };
}
export interface ActivityData { days: { date: string; minutes: number; xp: number }[]; totalMinutes: number; totalXp: number }
