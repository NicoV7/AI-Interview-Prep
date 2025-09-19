/**
 * Roadmap Generation Service
 *
 * Creates intelligent, personalized study roadmaps using AI analysis
 * of user progress data and interview preparation best practices
 */

import {
  StudyRoadmap,
  RoadmapGenerationContext,
  AIRoadmapPrompt,
  AIProvider,
  CachedRoadmap
} from '../types/roadmap';
import { ProgressResponse } from '../types/leetcode';
import { AIService } from './aiService';
import { progressService } from './progressService';

interface RoadmapCache {
  [userId: string]: CachedRoadmap;
}

export class RoadmapService {
  private static cache: RoadmapCache = {};
  private static readonly CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Generate personalized roadmap for user
   */
  static async generateRoadmap(
    userId: string,
    aiProvider: AIProvider,
    preferences?: RoadmapGenerationContext['userPreferences'],
    forceRegenerate: boolean = false
  ): Promise<StudyRoadmap> {
    // Check cache first
    if (!forceRegenerate) {
      const cached = this.getCachedRoadmap(userId);
      if (cached) {
        console.log(`Returning cached roadmap for user: ${userId}`);
        return cached.roadmap;
      }
    }

    console.log(`Generating new roadmap for user: ${userId}`);

    // Get user's progress data
    const progressData = await progressService.getUserProgress(userId);

    // Create generation context
    const context = this.createGenerationContext(userId, progressData, preferences);

    // Generate AI prompt
    const prompt = this.createRoadmapPrompt(context);

    // Call AI service
    const aiResponse = await AIService.generateRoadmap(aiProvider, prompt);

    if (!aiResponse.success || !aiResponse.data) {
      throw new Error(`Failed to generate roadmap: ${aiResponse.error?.message}`);
    }

    // Validate and enhance the response
    const roadmap = this.validateAndEnhanceRoadmap(aiResponse.data, context);

    // Cache the result
    this.cacheRoadmap(userId, roadmap);

    console.log(`Successfully generated roadmap for user: ${userId}`);
    return roadmap;
  }

  /**
   * Create generation context from progress data
   */
  private static createGenerationContext(
    userId: string,
    progressData: ProgressResponse,
    preferences?: RoadmapGenerationContext['userPreferences']
  ): RoadmapGenerationContext {
    return {
      userId,
      progressData: {
        totalProblems: progressData.overallStats.totalProblems,
        solvedProblems: progressData.overallStats.totalSolved,
        progressPercentage: progressData.overallStats.progressPercentage,
        topicProgress: progressData.topicProgress.map(topic => ({
          topicName: topic.topicName,
          progressPercentage: topic.progressPercentage,
          solvedProblems: topic.solvedProblems,
          totalProblems: topic.totalProblems,
          lastPracticed: topic.lastPracticed
        })),
        difficultyStats: progressData.overallStats.difficultyStats,
        recentActivity: progressData.recentActivity,
        currentStreak: progressData.streakInfo.currentStreak,
        avgSolveTime: progressData.overallStats.avgSolveTime
      },
      userPreferences: preferences
    };
  }

  /**
   * Create sophisticated AI prompt for roadmap generation
   */
  private static createRoadmapPrompt(context: RoadmapGenerationContext): AIRoadmapPrompt {
    const systemPrompt = `You are an expert coding interview preparation coach with deep knowledge of algorithms, data structures, and technical interview best practices. Your task is to analyze a user's LeetCode-style progress data and create a highly personalized, actionable study roadmap.

Key Principles:
1. Focus on the most impactful improvements for interview success
2. Balance addressing weaknesses with reinforcing strengths
3. Consider recency of practice and learning curves
4. Provide specific, actionable recommendations
5. Account for different skill levels and timelines

Response Format: You must respond with valid JSON matching this exact schema:
{
  "userId": "string",
  "generatedAt": "string (ISO date)",
  "nextFocusArea": {
    "topic": "string",
    "reason": "string (detailed explanation)",
    "priority": "high|medium|low",
    "estimatedTimeToImprove": "string (e.g., '1-2 weeks')"
  },
  "recommendedProblems": [
    {
      "problemId": number,
      "title": "string",
      "difficulty": "Easy|Medium|Hard",
      "topic": "string",
      "reason": "string (why this specific problem)",
      "order": number
    }
  ],
  "studyPlan": {
    "weeklyGoals": ["string array of specific goals"],
    "dailyTimeRecommendation": number (minutes),
    "focusAreas": ["string array of topics to focus on"]
  },
  "weakestTopics": [
    {
      "topic": "string",
      "currentProgress": number (0-100),
      "targetProgress": number (0-100),
      "actionItems": ["string array of specific actions"]
    }
  ],
  "overallRecommendation": {
    "skillLevel": "beginner|intermediate|advanced|expert",
    "readinessScore": number (0-100),
    "keyStrengths": ["string array"],
    "criticalGaps": ["string array"],
    "timelineEstimate": "string"
  }
}`;

    const userPrompt = this.buildUserPrompt(context);

    return {
      systemPrompt,
      userPrompt,
      expectedSchema: {} // Schema validation handled in response
    };
  }

  /**
   * Build detailed user prompt with progress analysis
   */
  private static buildUserPrompt(context: RoadmapGenerationContext): string {
    const { progressData, userPreferences } = context;

    // Calculate skill level
    const skillLevel = this.determineSkillLevel(progressData);

    // Find weakest areas
    const weakestTopics = progressData.topicProgress
      .filter(topic => topic.progressPercentage < 0.7)
      .sort((a, b) => a.progressPercentage - b.progressPercentage)
      .slice(0, 5);

    // Analyze recent activity
    const recentActivityAnalysis = this.analyzeRecentActivity(progressData.recentActivity);

    // Calculate interview readiness indicators
    const readinessFactors = this.calculateReadinessFactors(progressData);

    const prompt = `Please analyze this user's coding interview preparation progress and create a personalized roadmap.

USER PROGRESS ANALYSIS:
- Total Progress: ${progressData.solvedProblems}/${progressData.totalProblems} problems (${Math.round(progressData.progressPercentage * 100)}%)
- Current Skill Level: ${skillLevel}
- Current Streak: ${progressData.currentStreak} days
- Average Solve Time: ${Math.round(progressData.avgSolveTime)} minutes

DIFFICULTY BREAKDOWN:
- Easy: ${progressData.difficultyStats.easy.solved}/${progressData.difficultyStats.easy.total} (${Math.round(progressData.difficultyStats.easy.percentage * 100)}%)
- Medium: ${progressData.difficultyStats.medium.solved}/${progressData.difficultyStats.medium.total} (${Math.round(progressData.difficultyStats.medium.percentage * 100)}%)
- Hard: ${progressData.difficultyStats.hard.solved}/${progressData.difficultyStats.hard.total} (${Math.round(progressData.difficultyStats.hard.percentage * 100)}%)

TOPIC PERFORMANCE (weakest areas):
${weakestTopics.map(topic =>
  `- ${topic.topicName}: ${Math.round(topic.progressPercentage * 100)}% (${topic.solvedProblems}/${topic.totalProblems}) - Last practiced: ${this.formatLastPracticed(topic.lastPracticed)}`
).join('\n')}

RECENT ACTIVITY PATTERN:
${recentActivityAnalysis}

READINESS INDICATORS:
${readinessFactors.map(factor => `- ${factor}`).join('\n')}

USER PREFERENCES:
${userPreferences ? `
- Target Role: ${userPreferences.targetRole || 'Software Engineer'}
- Interview Timeline: ${userPreferences.timelineToInterview || 'Not specified'}
- Preferred Difficulty: ${userPreferences.preferredDifficulty || 'gradual'}
- Focus Areas: ${userPreferences.focusAreas?.join(', ') || 'None specified'}
` : 'No specific preferences provided'}

REQUIREMENTS:
1. Identify the single most important focus area for maximum impact
2. Recommend 5-8 specific problems in order of priority
3. Create a realistic weekly study plan
4. Provide actionable steps for the 3-4 weakest topics
5. Give an honest assessment of interview readiness and timeline

Focus on practical, achievable goals that build momentum and confidence while addressing critical gaps.`;

    return prompt;
  }

  /**
   * Determine user's skill level based on progress metrics
   */
  private static determineSkillLevel(progressData: RoadmapGenerationContext['progressData']): string {
    const { totalSolved, progressPercentage, difficultyStats } = progressData;

    const hardPercentage = difficultyStats.hard.percentage;
    const mediumPercentage = difficultyStats.medium.percentage;

    if (totalSolved < 50) return 'beginner';
    if (totalSolved < 150 || hardPercentage < 0.1) return 'intermediate';
    if (totalSolved < 300 || hardPercentage < 0.3) return 'advanced';
    return 'expert';
  }

  /**
   * Analyze recent activity patterns
   */
  private static analyzeRecentActivity(recentActivity: Array<{ date: string; problemsSolved: number; topics: string[]; }>): string {
    if (recentActivity.length === 0) {
      return 'No recent activity detected - consistency is crucial for interview prep.';
    }

    const avgProblemsPerDay = recentActivity.reduce((sum, day) => sum + day.problemsSolved, 0) / recentActivity.length;
    const activeDays = recentActivity.filter(day => day.problemsSolved > 0).length;
    const consistency = activeDays / recentActivity.length;

    let analysis = `Average ${avgProblemsPerDay.toFixed(1)} problems/day over ${recentActivity.length} days. `;

    if (consistency > 0.8) {
      analysis += 'Excellent consistency! ';
    } else if (consistency > 0.5) {
      analysis += 'Good consistency, but room for improvement. ';
    } else {
      analysis += 'Inconsistent practice - this is a key area to improve. ';
    }

    return analysis;
  }

  /**
   * Calculate interview readiness factors
   */
  private static calculateReadinessFactors(progressData: RoadmapGenerationContext['progressData']): string[] {
    const factors = [];

    if (progressData.difficultyStats.easy.percentage > 0.8) {
      factors.push('Strong foundation in easy problems ✓');
    } else {
      factors.push('Need to strengthen fundamentals (easy problems)');
    }

    if (progressData.difficultyStats.medium.percentage > 0.6) {
      factors.push('Good progress on medium difficulty ✓');
    } else {
      factors.push('Medium problems need significant work');
    }

    if (progressData.currentStreak > 7) {
      factors.push('Excellent practice consistency ✓');
    } else if (progressData.currentStreak > 3) {
      factors.push('Good practice momentum');
    } else {
      factors.push('Need to build consistent practice habit');
    }

    if (progressData.avgSolveTime < 30) {
      factors.push('Efficient problem-solving speed ✓');
    } else {
      factors.push('Could improve problem-solving speed');
    }

    return factors;
  }

  /**
   * Format last practiced time for human readability
   */
  private static formatLastPracticed(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'yesterday';

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  }

  /**
   * Validate and enhance AI-generated roadmap
   */
  private static validateAndEnhanceRoadmap(
    roadmap: StudyRoadmap,
    context: RoadmapGenerationContext
  ): StudyRoadmap {
    // Ensure userId is set
    roadmap.userId = context.userId;

    // Validate required fields
    if (!AIService.validateRoadmapStructure(roadmap)) {
      throw new Error('Invalid roadmap structure received from AI');
    }

    // Enhance with realistic problem IDs (since we have mock data)
    roadmap.recommendedProblems = roadmap.recommendedProblems.map((problem, index) => ({
      ...problem,
      problemId: 1000 + index, // Generate realistic IDs
      order: index + 1
    }));

    return roadmap;
  }

  /**
   * Cache management
   */
  private static getCachedRoadmap(userId: string): CachedRoadmap | null {
    const cached = this.cache[userId];
    if (!cached) return null;

    const now = new Date();
    const expiresAt = new Date(cached.expiresAt);

    if (now > expiresAt) {
      delete this.cache[userId];
      return null;
    }

    return cached;
  }

  private static cacheRoadmap(userId: string, roadmap: StudyRoadmap): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_DURATION_MS);

    this.cache[userId] = {
      roadmap,
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: '1.0'
    };
  }

  /**
   * Clear cache for specific user or all users
   */
  static clearCache(userId?: string): void {
    if (userId) {
      delete this.cache[userId];
    } else {
      this.cache = {};
    }
  }
}