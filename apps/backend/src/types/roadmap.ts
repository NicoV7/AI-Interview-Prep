/**
 * AI-Powered Roadmap Generation Types
 *
 * Defines structures for personalized study roadmaps based on user progress analysis
 */

export interface StudyRoadmap {
  userId: string;
  generatedAt: string;
  nextFocusArea: {
    topic: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTimeToImprove: string;
  };
  recommendedProblems: Array<{
    problemId: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    reason: string;
    order: number;
  }>;
  studyPlan: {
    weeklyGoals: string[];
    dailyTimeRecommendation: number; // in minutes
    focusAreas: string[];
  };
  weakestTopics: Array<{
    topic: string;
    currentProgress: number; // percentage 0-100
    targetProgress: number; // percentage 0-100
    actionItems: string[];
  }>;
  overallRecommendation: {
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    readinessScore: number; // 0-100 scale for interview readiness
    keyStrengths: string[];
    criticalGaps: string[];
    timelineEstimate: string; // e.g., "2-3 weeks", "1-2 months"
  };
}

export interface RoadmapGenerationContext {
  userId: string;
  progressData: {
    totalProblems: number;
    solvedProblems: number;
    progressPercentage: number;
    topicProgress: Array<{
      topicName: string;
      progressPercentage: number;
      solvedProblems: number;
      totalProblems: number;
      lastPracticed: string;
    }>;
    difficultyStats: {
      easy: { solved: number; total: number; percentage: number };
      medium: { solved: number; total: number; percentage: number };
      hard: { solved: number; total: number; percentage: number };
    };
    recentActivity: Array<{
      date: string;
      problemsSolved: number;
      topics: string[];
    }>;
    currentStreak: number;
    avgSolveTime: number;
  };
  userPreferences?: {
    targetRole?: string; // e.g., "Software Engineer", "Frontend Developer"
    timelineToInterview?: string; // e.g., "2 weeks", "1 month"
    preferredDifficulty?: 'gradual' | 'challenging';
    focusAreas?: string[]; // user-specified topics of interest
  };
}

export interface AIRoadmapPrompt {
  systemPrompt: string;
  userPrompt: string;
  expectedSchema: any;
}

// AI Provider Integration Types
export interface AIProvider {
  name: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  model?: string;
}

export interface AIResponse {
  success: boolean;
  data?: StudyRoadmap;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Request/Response types for API endpoints
export interface GenerateRoadmapRequest {
  userId: string;
  regenerate?: boolean; // Force new generation even if recent roadmap exists
  preferences?: RoadmapGenerationContext['userPreferences'];
}

export interface RoadmapResponse {
  success: boolean;
  data?: StudyRoadmap;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
    cached: boolean;
    cacheExpiry?: string;
    aiProvider?: string;
    generationTimeMs?: number;
  };
}

// Caching and optimization types
export interface CachedRoadmap {
  roadmap: StudyRoadmap;
  generatedAt: string;
  expiresAt: string;
  version: string;
}

export interface RoadmapAnalytics {
  generationCount: number;
  averageGenerationTime: number;
  topRequestedFocusAreas: string[];
  userSatisfactionRating?: number;
}