/**
 * LeetCode-compatible data structures for progress tracking
 * Designed to match real LeetCode API response formats
 */

export interface LeetCodeProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  companies: string[];
  isPaid: boolean;
  acRate: number; // Acceptance rate as decimal (0.0 - 1.0)
  leetcodeUrl: string;
  content?: string; // Problem description
  hints?: string[];
  similar?: number[]; // IDs of similar problems
}

export interface UserSubmission {
  problemId: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compile Error';
  runtime: number; // Runtime in milliseconds
  memory: number; // Memory usage in MB
  submissionTime: string; // ISO string
  language: string;
  code?: string; // User's solution code
  submissionId: string;
  runtimePercentile?: number; // 0.0 - 1.0
  memoryPercentile?: number; // 0.0 - 1.0
}

export interface TopicProgress {
  topicName: string;
  totalProblems: number;
  solvedProblems: number;
  easyCount: { solved: number; total: number };
  mediumCount: { solved: number; total: number };
  hardCount: { solved: number; total: number };
  progressPercentage: number; // 0.0 - 1.0
  lastPracticed: string; // ISO string
  averageAcceptanceRate: number; // 0.0 - 1.0
  recentSubmissions: UserSubmission[];
  averageAttempts: number; // Average attempts before solving
  timeSpent: number; // Total time spent in minutes
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
  frequency: 'High' | 'Medium' | 'Low'; // How often this company asks these problems
}

export interface DifficultyStats {
  easy: { solved: number; total: number; percentage: number };
  medium: { solved: number; total: number; percentage: number };
  hard: { solved: number; total: number; percentage: number };
}

export interface StreakInfo {
  currentStreak: number;
  maxStreak: number;
  streakDates: string[]; // ISO dates of consecutive solving days
  lastSolvedDate: string;
}

export interface WeakestTopic {
  topicName: string;
  progressPercentage: number;
  problemsToImprove: LeetCodeProblem[];
  suggestedOrder: number[]; // Problem IDs in recommended learning order
}

export interface ProblemRecommendation {
  problem: LeetCodeProblem;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedDifficulty: number; // 1-10 scale based on user's current level
  topics: string[];
  expectedLearning: string[];
}

export interface OverallStats {
  totalSolved: number;
  totalProblems: number;
  progressPercentage: number; // 0.0 - 1.0
  currentStreak: number;
  maxStreak: number;
  ranking: number; // User's ranking among all users
  contestRating: number;
  difficultyStats: DifficultyStats;
  accuracyRate: number; // Percentage of first-attempt successes
  avgSolveTime: number; // Average time to solve in minutes
}

export interface RecentActivity {
  date: string; // ISO string
  problemsSolved: number;
  timeSpent: number; // Minutes
  topics: string[];
  submissions: UserSubmission[];
  achievements?: string[]; // Badges or milestones achieved
}

export interface ProgressResponse {
  userId: string;
  lastUpdated: string; // ISO string
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

export interface LeetCodeUser {
  userId: string;
  username: string;
  email: string;
  joinDate: string;
  lastActiveDate: string;
  preferences: {
    preferredLanguages: string[];
    difficultyPreference: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
    topicFocus: string[];
    companyFocus: string[];
    dailyGoal: number;
  };
}

// Service interface for abstraction
export interface IProgressService {
  getUserProgress(userId: string): Promise<ProgressResponse>;
  updateUserProgress(userId: string, submission: UserSubmission): Promise<void>;
  getProblemsByTopic(topic: string, difficulty?: string): Promise<LeetCodeProblem[]>;
  getProblemsByCompany(company: string, difficulty?: string): Promise<LeetCodeProblem[]>;
  getRecommendations(userId: string, count?: number): Promise<ProblemRecommendation[]>;
  searchProblems(query: string, filters?: ProblemFilters): Promise<LeetCodeProblem[]>;
}

export interface ProblemFilters {
  difficulty?: ('Easy' | 'Medium' | 'Hard')[];
  topics?: string[];
  companies?: string[];
  status?: 'Solved' | 'Unsolved' | 'Attempted';
  isPaid?: boolean;
  minAcceptanceRate?: number;
  maxAcceptanceRate?: number;
}

// API Response wrapper
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
    debug?: any;
  };
}