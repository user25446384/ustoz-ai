export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type StudyTime = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface SubjectItem {
  id: string; name: string; slug: string; description: string | null; icon: string | null; color: string | null; _count?: { topics: number };
}

export interface StudentProfile {
  id: string; grade: number | null; school: string | null; level: Level; goals: string | null; interests: string[];
  preferredLanguage: string; studyTime: StudyTime | null; dailyGoal: number; onboarded: boolean;
  subjects: { id: string; name: string; slug: string; icon: string | null; color: string | null }[];
}

export interface QuizListItem {
  id: string; title: string; description: string | null; duration: number | null; difficulty: string; isDiagnostic: boolean;
  topic: { id: string; title: string; slug: string; subject: { id: string; name: string; slug: string } };
  _count: { questions: number };
}

export interface Draft {
  fullName: string; grade: number | null; level: Level; subjectIds: string[]; goals: string; dailyGoal: number; studyTime: StudyTime | null;
}
