export type Band = 'NOT_ASSESSED' | 'WEAK' | 'PRACTICE' | 'STRONG';

export interface TopicProgress {
  mastery: number; averageScore: number; completedLessons: number; quizAttempts: number; lastActivity: string;
  topicId: string; assessed: boolean; band: Band;
  topic: { id: string; title: string; slug: string; subject: { id: string; name: string; slug: string; color: string | null } };
}

export interface Recommendation {
  id: string; type: 'REVIEW_TOPIC' | 'PRACTICE' | 'ADVANCED_UNLOCK' | 'GENERAL'; title: string; description: string;
  topicId: string | null; isRead: boolean; createdAt: string;
  metadata: { lessonIds?: string[]; quizIds?: string[]; nextTopics?: { slug: string; title: string }[] } | null;
}

export interface Overview {
  xp: { total: number; level: number; currentLevelXp: number; nextLevelXp: number; progressPct: number };
  streak: { current: number; studiedToday: boolean };
  daily: { goalMinutes: number; todayMinutes: number; goalReached: boolean };
  week: { date: string; minutes: number }[];
  overallMastery: number | null;
  weakTopics: TopicProgress[];
  strongTopics: TopicProgress[];
  recentQuizzes: { id: string; percentage: number; score: number; maxScore: number; completedAt: string; quiz: { id: string; title: string } }[];
  nextLesson: {
    id: string; title: string; estimatedMinutes: number; topic: { title: string; slug: string }; source: 'PLAN' | 'SUBJECTS'; planDay: number | null;
  } | null;
  recommendations: Recommendation[];
}

export interface SubjectSummary {
  id: string; name: string; slug: string; icon: string | null; color: string | null; topics: number; assessedTopics: number;
  avgMastery: number | null; lessons: { total: number; completed: number };
}

export interface AchievementsData {
  earnedCount: number; total: number;
  items: { id: string; code: string; name: string; description: string; icon: string | null; xpReward: number; earned: boolean; earnedAt: string | null; progress: { current: number; target: number } | null }[];
}

export interface PlanListItem {
  id: string; title: string; status: string; subject: { name: string } | null; progress: { total: number; completed: number; percentage: number };
}
