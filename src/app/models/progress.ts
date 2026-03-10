export interface UserProgress {
  userId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  completedLessons: string[];
  progressPercent: number;    
}