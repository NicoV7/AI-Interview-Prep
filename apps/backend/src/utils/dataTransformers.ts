/**
 * Data transformation utilities for LeetCode integration
 * Provides abstraction layer for future real LeetCode API integration
 */

import {
  LeetCodeProblem,
  UserSubmission,
  TopicProgress,
  CompanyProgress,
  OverallStats,
  ProgressResponse,
  ProblemRecommendation,
  WeakestTopic,
  StreakInfo,
  DifficultyStats
} from '../types/leetcode';

/**
 * Raw LeetCode API response interfaces (for future integration)
 */
export interface RawLeetCodeProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags: Array<{ name: string; slug: string }>;
  companyTags?: Array<{ name: string; slug: string }>;
  isPaid: boolean;
  acRate: number;
  content?: string;
  hints?: string[];
  similarQuestions?: string;
}

export interface RawSubmissionResponse {
  id: string;
  status: string;
  runtime: string;
  memory: string;
  timestamp: number;
  lang: string;
  question: {
    questionId: string;
    title: string;
  };
}

export interface RawUserStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  userAvatar: string;
  realName: string;
  submitStats: {
    acSubmissionNum: Array<{
      difficulty: string;
      count: number;
      submissions: number;
    }>;
  };
}

/**
 * Transform raw LeetCode problem data to our standardized format
 */
export function transformLeetCodeProblem(raw: RawLeetCodeProblem): LeetCodeProblem {
  return {
    id: parseInt(raw.questionId),
    title: raw.title,
    slug: raw.titleSlug,
    difficulty: normalizeDifficulty(raw.difficulty),
    topics: raw.topicTags.map(tag => tag.name),
    companies: raw.companyTags?.map(tag => tag.name) || [],
    isPaid: raw.isPaid,
    acRate: raw.acRate / 100, // Convert percentage to decimal
    leetcodeUrl: `https://leetcode.com/problems/${raw.titleSlug}/`,
    content: raw.content,
    hints: raw.hints || [],
    similar: parseSimilarQuestions(raw.similarQuestions)
  };
}

/**
 * Transform raw submission data to our standardized format
 */
export function transformSubmission(raw: RawSubmissionResponse): UserSubmission {
  return {
    problemId: parseInt(raw.question.questionId),
    status: normalizeSubmissionStatus(raw.status),
    runtime: parseRuntime(raw.runtime),
    memory: parseMemory(raw.memory),
    submissionTime: new Date(raw.timestamp * 1000).toISOString(),
    language: raw.lang,
    submissionId: raw.id,
    runtimePercentile: Math.random(), // Would need additional API call for percentiles
    memoryPercentile: Math.random()
  };
}

/**
 * Transform raw user stats to our overall stats format
 */
export function transformUserStats(raw: RawUserStats): Partial<OverallStats> {
  const easyStats = raw.submitStats.acSubmissionNum.find(s => s.difficulty === 'Easy');
  const mediumStats = raw.submitStats.acSubmissionNum.find(s => s.difficulty === 'Medium');
  const hardStats = raw.submitStats.acSubmissionNum.find(s => s.difficulty === 'Hard');

  return {
    totalSolved: raw.totalSolved,
    totalProblems: raw.totalQuestions,
    progressPercentage: raw.totalSolved / raw.totalQuestions,
    ranking: raw.ranking,
    difficultyStats: {
      easy: {
        solved: raw.easySolved,
        total: easyStats?.submissions || 0,
        percentage: raw.easySolved / (easyStats?.submissions || 1)
      },
      medium: {
        solved: raw.mediumSolved,
        total: mediumStats?.submissions || 0,
        percentage: raw.mediumSolved / (mediumStats?.submissions || 1)
      },
      hard: {
        solved: raw.hardSolved,
        total: hardStats?.submissions || 0,
        percentage: raw.hardSolved / (hardStats?.submissions || 1)
      }
    }
  };
}

/**
 * Normalize difficulty strings from various sources
 */
function normalizeDifficulty(difficulty: string): 'Easy' | 'Medium' | 'Hard' {
  const normalized = difficulty.toLowerCase();
  switch (normalized) {
    case 'easy':
    case '1':
      return 'Easy';
    case 'medium':
    case '2':
      return 'Medium';
    case 'hard':
    case '3':
      return 'Hard';
    default:
      return 'Medium'; // Default fallback
  }
}

/**
 * Normalize submission status from various sources
 */
function normalizeSubmissionStatus(status: string): UserSubmission['status'] {
  const normalized = status.toLowerCase().replace(/[^a-z]/g, '');

  const statusMap: Record<string, UserSubmission['status']> = {
    'accepted': 'Accepted',
    'wronganswer': 'Wrong Answer',
    'timelimitexceeded': 'Time Limit Exceeded',
    'memorylimitexceeded': 'Memory Limit Exceeded',
    'runtimeerror': 'Runtime Error',
    'compileerror': 'Compile Error'
  };

  return statusMap[normalized] || 'Wrong Answer';
}

/**
 * Parse runtime string to milliseconds
 */
function parseRuntime(runtime: string): number {
  // Handle various formats: "12 ms", "120ms", "1.2s"
  const match = runtime.match(/(\d+(?:\.\d+)?)\s*(ms|s)?/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'ms';

  return unit === 's' ? value * 1000 : value;
}

/**
 * Parse memory string to MB
 */
function parseMemory(memory: string): number {
  // Handle various formats: "14.2 MB", "1024KB", "1GB"
  const match = memory.match(/(\d+(?:\.\d+)?)\s*(MB|KB|GB)?/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = (match[2] || 'MB').toUpperCase();

  switch (unit) {
    case 'KB':
      return value / 1024;
    case 'GB':
      return value * 1024;
    default:
      return value;
  }
}

/**
 * Parse similar questions JSON string
 */
function parseSimilarQuestions(similarStr?: string): number[] {
  if (!similarStr) return [];

  try {
    const similar = JSON.parse(similarStr);
    return Array.isArray(similar)
      ? similar.map(q => parseInt(q.questionId || q.id)).filter(id => !isNaN(id))
      : [];
  } catch {
    return [];
  }
}

/**
 * Data sanitization utilities
 */
export class DataSanitizer {
  /**
   * Sanitize problem data for client consumption
   */
  static sanitizeProblem(problem: LeetCodeProblem): LeetCodeProblem {
    return {
      ...problem,
      title: this.sanitizeString(problem.title, 100),
      topics: problem.topics.map(topic => this.sanitizeString(topic, 50)),
      companies: problem.companies.map(company => this.sanitizeString(company, 50)),
      acRate: Math.max(0, Math.min(1, problem.acRate)), // Ensure 0-1 range
      hints: problem.hints?.map(hint => this.sanitizeString(hint, 500)) || []
    };
  }

  /**
   * Sanitize submission data
   */
  static sanitizeSubmission(submission: UserSubmission): UserSubmission {
    return {
      ...submission,
      runtime: Math.max(0, submission.runtime),
      memory: Math.max(0, submission.memory),
      language: this.sanitizeString(submission.language, 20),
      runtimePercentile: submission.runtimePercentile ?
        Math.max(0, Math.min(1, submission.runtimePercentile)) : undefined,
      memoryPercentile: submission.memoryPercentile ?
        Math.max(0, Math.min(1, submission.memoryPercentile)) : undefined
    };
  }

  /**
   * Sanitize string input
   */
  private static sanitizeString(str: string, maxLength: number): string {
    if (typeof str !== 'string') return '';

    return str
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .trim()
      .slice(0, maxLength);
  }
}

/**
 * Cache management utilities
 */
export class CacheManager {
  private static cache = new Map<string, { data: any; expiry: number }>();

  /**
   * Get cached data if not expired
   */
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache with TTL
   */
  static set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  /**
   * Clear expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate cache key for user progress
   */
  static generateProgressKey(userId: string): string {
    return `progress:${userId}`;
  }

  /**
   * Generate cache key for problem queries
   */
  static generateProblemKey(type: string, identifier: string, filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `problems:${type}:${identifier}:${filterStr}`;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimitManager {
  private static requests = new Map<string, number[]>();

  /**
   * Check if request is within rate limit
   */
  static checkLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (recentRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  /**
   * Clean up old entries
   */
  static cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [identifier, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => t > cutoff);

      if (recent.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recent);
      }
    }
  }
}

/**
 * Environment configuration for data sources
 */
export const DataSourceConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  useMockData: process.env.USE_MOCK_LEETCODE_DATA !== 'false',
  leetcodeApiUrl: process.env.LEETCODE_API_URL || 'https://leetcode.com/api',
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  defaultCacheTtl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100')
  }
};

/**
 * Factory for creating the appropriate data service
 */
export function createProgressService() {
  if (DataSourceConfig.useMockData) {
    const { MockLeetCodeService } = require('../services/progressService');
    return new MockLeetCodeService();
  } else {
    // Future: Return real LeetCode service implementation
    throw new Error('Real LeetCode integration not yet implemented');
  }
}

// Cleanup tasks (run periodically)
setInterval(() => {
  CacheManager.cleanup();
  RateLimitManager.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes