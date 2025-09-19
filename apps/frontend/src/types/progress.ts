// Progress data types matching backend API

export interface LeetCodeProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  companies: string[];
  isPaid: boolean;
  acRate: number;
  leetcodeUrl: string;
  content?: string;
  hints?: string[];
  similar?: number[];
}

export interface UserSubmission {
  problemId: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compile Error';
  runtime: number;
  memory: number;
  submissionTime: string;
  language: string;
  submissionId: string;
  runtimePercentile?: number;
  memoryPercentile?: number;
}

export interface TopicProgress {
  topicName: string;
  totalProblems: number;
  solvedProblems: number;
  easyCount: { solved: number; total: number };
  mediumCount: { solved: number; total: number };
  hardCount: { solved: number; total: number };
  progressPercentage: number;
  lastPracticed: string;
  averageAcceptanceRate: number;
  recentSubmissions: UserSubmission[];
  averageAttempts: number;
  timeSpent: number;
}

export interface CompanyProgress {
  companyName: string;
  totalProblems: number;
  solvedProblems: number;
  easyCount: { solved: number; total: number };
  mediumCount: { solved: number; total: number };
  hardCount: { solved: number; total: number };
  progressPercentage: number;
  lastPracticed: string;
  frequency: 'High' | 'Medium' | 'Low';
}

export interface DifficultyStats {
  easy: { solved: number; total: number; percentage: number };
  medium: { solved: number; total: number; percentage: number };
  hard: { solved: number; total: number; percentage: number };
}

export interface StreakInfo {
  currentStreak: number;
  maxStreak: number;
  streakDates: string[];
  lastSolvedDate: string;
}

export interface OverallStats {
  totalSolved: number;
  totalProblems: number;
  progressPercentage: number;
  currentStreak: number;
  maxStreak: number;
  ranking: number;
  contestRating: number;
  difficultyStats: DifficultyStats;
  accuracyRate: number;
  avgSolveTime: number;
}

export interface RecentActivity {
  date: string;
  problemsSolved: number;
  timeSpent: number;
  topics: string[];
  submissions: UserSubmission[];
  achievements?: string[];
}

export interface WeakestTopic {
  topicName: string;
  progressPercentage: number;
  problemsToImprove: LeetCodeProblem[];
  suggestedOrder: number[];
}

export interface ProblemRecommendation {
  problem: LeetCodeProblem;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedDifficulty: number;
  topics: string[];
  expectedLearning: string[];
}

export interface ProgressResponse {
  userId: string;
  lastUpdated: string;
  overallStats: OverallStats;
  topicProgress: TopicProgress[];
  companyProgress: CompanyProgress[];
  recentActivity: RecentActivity[];
  weakestTopics: WeakestTopic[];
  strongestTopics: string[];
  nextRecommendations: ProblemRecommendation[];
  streakInfo: StreakInfo;
  goals?: {
    dailyTarget: number;
    weeklyTarget: number;
    targetTopics: string[];
    targetCompanies: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
    cached: boolean;
    cacheExpiry?: string;
  };
}

// UI Helper types
export interface TopicCard {
  name: string;
  progress: number;
  solved: number;
  total: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  color: string;
  lastPracticed: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface StreakCalendarDay {
  date: string;
  hasSolved: boolean;
  problemCount: number;
  isToday: boolean;
}