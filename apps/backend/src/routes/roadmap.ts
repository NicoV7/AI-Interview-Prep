/**
 * Roadmap API Routes
 *
 * Handles AI-powered roadmap generation and retrieval
 */

import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { requireConfigMiddleware } from '../middleware/cookieConfig';
import { RoadmapService } from '../services/roadmapService';
import {
  GenerateRoadmapRequest,
  RoadmapResponse,
  AIProvider,
  StudyRoadmap
} from '../types/roadmap';

const router = express.Router();

// Simple async handler
const asyncHandler = (fn: (req: Request, res: Response, next: express.NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Rate limiting for AI calls - more restrictive than other endpoints
const roadmapRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 roadmap requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many roadmap generation requests. Please try again later.',
      details: { retryAfter: '15 minutes' }
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Helper function to create standardized API responses
 */
function createRoadmapResponse(
  success: boolean,
  data?: StudyRoadmap,
  error?: any,
  meta?: Partial<RoadmapResponse['meta']>
): RoadmapResponse {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
      version: 'v1',
      cached: false,
      ...meta
    }
  };
}

/**
 * Extract AI provider from user configuration
 */
function getAIProviderFromConfig(userConfig: any): AIProvider {
  if (!userConfig?.provider || !userConfig?.apiKey) {
    throw new Error('AI provider configuration not found. Please complete setup.');
  }

  return {
    name: userConfig.provider,
    apiKey: userConfig.apiKey,
    model: userConfig.model
  };
}

/**
 * GET /api/v1/roadmap/:userId
 * Generate or retrieve personalized study roadmap
 */
router.get('/:userId',
  roadmapRateLimit,
  requireConfigMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { regenerate = 'false', timeline, targetRole, difficulty } = req.query;

    // Verify user has access to this data
    if (req.userConfig?.email !== userId) {
      return res.status(403).json(createRoadmapResponse(false, undefined, {
        code: 'ACCESS_DENIED',
        message: 'You can only access your own roadmap'
      }));
    }

    try {
      console.log(`Generating roadmap for user: ${userId}`);
      const startTime = Date.now();

      // Get AI provider from user config
      const aiProvider = getAIProviderFromConfig(req.userConfig);

      // Parse user preferences from query parameters
      const preferences = {
        targetRole: targetRole as string,
        timelineToInterview: timeline as string,
        preferredDifficulty: (difficulty as 'gradual' | 'challenging') || 'gradual'
      };

      // Generate roadmap
      const roadmap = await RoadmapService.generateRoadmap(
        userId,
        aiProvider,
        preferences,
        regenerate === 'true'
      );

      const generationTime = Date.now() - startTime;

      console.log(`Successfully generated roadmap for ${userId} in ${generationTime}ms`);

      return res.status(200).json(createRoadmapResponse(true, roadmap, undefined, {
        cached: regenerate !== 'true',
        aiProvider: aiProvider.name,
        generationTimeMs: generationTime
      }));

    } catch (error) {
      console.error('Error generating roadmap:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Handle specific error types
      if (errorMessage.includes('AI provider configuration')) {
        return res.status(400).json(createRoadmapResponse(false, undefined, {
          code: 'CONFIGURATION_ERROR',
          message: errorMessage,
          details: { action: 'Please check your AI provider settings' }
        }));
      }

      if (errorMessage.includes('API error')) {
        return res.status(502).json(createRoadmapResponse(false, undefined, {
          code: 'AI_SERVICE_ERROR',
          message: 'Failed to communicate with AI provider',
          details: { originalError: errorMessage }
        }));
      }

      return res.status(500).json(createRoadmapResponse(false, undefined, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate roadmap',
        details: { error: errorMessage }
      }));
    }
  })
);

/**
 * POST /api/v1/roadmap/:userId/regenerate
 * Force regenerate roadmap with new preferences
 */
router.post('/:userId/regenerate',
  roadmapRateLimit,
  requireConfigMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const preferences = req.body;

    // Verify user has access to this data
    if (req.userConfig?.email !== userId) {
      return res.status(403).json(createRoadmapResponse(false, undefined, {
        code: 'ACCESS_DENIED',
        message: 'You can only regenerate your own roadmap'
      }));
    }

    try {
      console.log(`Regenerating roadmap for user: ${userId} with preferences:`, preferences);
      const startTime = Date.now();

      // Get AI provider from user config
      const aiProvider = getAIProviderFromConfig(req.userConfig);

      // Generate new roadmap
      const roadmap = await RoadmapService.generateRoadmap(
        userId,
        aiProvider,
        preferences,
        true // Force regenerate
      );

      const generationTime = Date.now() - startTime;

      console.log(`Successfully regenerated roadmap for ${userId} in ${generationTime}ms`);

      return res.status(200).json(createRoadmapResponse(true, roadmap, undefined, {
        cached: false,
        aiProvider: aiProvider.name,
        generationTimeMs: generationTime
      }));

    } catch (error) {
      console.error('Error regenerating roadmap:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return res.status(500).json(createRoadmapResponse(false, undefined, {
        code: 'REGENERATION_ERROR',
        message: 'Failed to regenerate roadmap',
        details: { error: errorMessage }
      }));
    }
  })
);

/**
 * DELETE /api/v1/roadmap/:userId/cache
 * Clear cached roadmap for user
 */
router.delete('/:userId/cache',
  requireConfigMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Verify user has access to this data
    if (req.userConfig?.email !== userId) {
      return res.status(403).json(createRoadmapResponse(false, undefined, {
        code: 'ACCESS_DENIED',
        message: 'You can only clear your own roadmap cache'
      }));
    }

    try {
      RoadmapService.clearCache(userId);

      console.log(`Cleared roadmap cache for user: ${userId}`);

      return res.status(200).json(createRoadmapResponse(true, undefined, undefined, {
        cached: false
      }));

    } catch (error) {
      console.error('Error clearing roadmap cache:', error);

      return res.status(500).json(createRoadmapResponse(false, undefined, {
        code: 'CACHE_CLEAR_ERROR',
        message: 'Failed to clear roadmap cache'
      }));
    }
  })
);

/**
 * GET /api/v1/roadmap/health
 * Health check for roadmap service
 */
router.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json(createRoadmapResponse(true, undefined, undefined, {
    cached: false
  }));
});

export { router as roadmapRouter };