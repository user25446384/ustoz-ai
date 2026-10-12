'use client';

import { useQuery } from '@tanstack/react-query';
import type { QuizListItem } from '@/features/onboarding/types';
import { api } from '@/lib/api/client';
import type { LessonListItem } from './types';

/** Mavzudagi darslar (o'quvchi uchun `completed` bayrog'i bilan). Mavzu va dars sahifalari bir xil keshni ishlatadi. */
export function useTopicLessons(topicId: string | undefined) {
  return useQuery({
    queryKey: ['lessons', 'topic', topicId], enabled: !!topicId,
    queryFn: ({ signal }) => api.getPage<LessonListItem>('/lessons', { params: { topicId, limit: 100, sort: 'order' }, signal }),
  });
}

export function useTopicQuizzes(topicId: string | undefined) {
  return useQuery({
    queryKey: ['quizzes', 'topic', topicId], enabled: !!topicId,
    queryFn: ({ signal }) => api.getPage<QuizListItem>('/quizzes', { params: { topicId, isDiagnostic: false, limit: 20 }, signal }),
  });
}
