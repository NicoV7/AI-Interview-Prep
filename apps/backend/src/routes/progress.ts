import express, { Request, Response } from 'express';
import { requireConfigMiddleware } from '../middleware/cookieConfig';
import { progressService } from '../services/progressService';

const router = express.Router();

// Simple async handler
const asyncHandler = (fn: (req: Request, res: Response, next: express.NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Helper function to create standardized API responses
 */
function createApiResponse<T>(success: boolean, data?: T, error?: any) {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
      version: 'v1',
      cached: false
    }
  };
}

/**
 * GET /api/v1/progress/:userId
 * Get comprehensive progress data for a user
 */
router.get('/:userId',
  requireConfigMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Verify user has access to this data (user can only access their own progress)
    if (req.userConfig?.email !== userId) {
      return res.status(403).json(createApiResponse(false, null, {
        code: 'ACCESS_DENIED',
        message: 'You can only access your own progress data'
      }));
    }

    console.log(`Fetching progress for user: ${userId}`);

    try {
      const progressData = await progressService.getUserProgress(userId);

      return res.status(200).json(createApiResponse(true, progressData));
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return res.status(500).json(createApiResponse(false, null, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch progress data'
      }));
    }
  })
);

/**
 * GET /api/v1/progress/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json(createApiResponse(true, {
    status: 'healthy',
    service: 'progress-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: 'v1'
  }));
});

export { router as progressRouter };