export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER';
export type AnswerValue = number | boolean | string;

export interface AttemptQuestion {
  id: string; order: number; type: QuestionType; question: string; options: string[] | null; points: number; difficulty: string;
}

export interface InProgressAttempt {
  status: 'IN_PROGRESS';
  attemptId: string;
  quiz: { id: string; title: string; duration: number | null; isDiagnostic: boolean };
  startedAt: string;
  deadline: string | null;
  serverTime: string;
  questions: AttemptQuestion[];
  draft: Record<string, AnswerValue>;
}

export interface ReviewItem {
  questionId: string; order: number; type: QuestionType; question: string; options: string[] | null; topicId: string;
  yourAnswer: AnswerValue | null; correctAnswer: unknown; isCorrect: boolean; points: number; maxPoints: number;
  explanation: string | null; aiFeedback: string | null;
}

export type TopicLevel = 'WEAK' | 'PRACTICE' | 'STRONG';
export interface TopicResult {
  topicId: string; title?: string; slug?: string; correct: number; total: number; percentage: number; level: TopicLevel;
}

export interface Rewards {
  xp: number; streakBonusToday: number; totalXp: number; streak: number;
  level: number; currentLevelXp: number; nextLevelXp: number; progressPct: number;
  achievements: { code: string; name: string; description: string; icon: string | null; xpReward: number }[];
}

export interface QuizResult {
  status: 'COMPLETED';
  attempt: {
    id: string; quizId: string; quizTitle: string; isDiagnostic: boolean; startedAt: string; completedAt: string | null;
    durationSec: number | null; score: number; maxScore: number; percentage: number;
    total: number; correct: number; wrong: number; unanswered: number;
  };
  topics: TopicResult[];
  review: ReviewItem[];
  rewards: Rewards;
}
