import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import { requireConfigMiddleware } from '../middleware/cookieConfig';
import { progressService } from '../services/progressService';
import { ApiResponse, ProblemFilters, UserSubmission } from '../types/leetcode';
// Simple async handler
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Rate limiting for progress endpoints
const progressRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(progressRateLimit);

// Helper function to create API response
function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any },
  cached: boolean = false
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      version: 'v1',
      cached,
      cacheExpiry: cached ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : undefined
    }
  };
}

// Validation middleware
const validateUserId = [
  param('userId').isEmail().normalizeEmail().withMessage('Valid email required for userId')
];

const validateProblemFilters = [
  query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  query('isPaid').optional().isBoolean().withMessage('isPaid must be boolean'),
  query('minAcceptanceRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Invalid acceptance rate range'),
  query('maxAcceptanceRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Invalid acceptance rate range'),
  query('topics').optional().isString().withMessage('Topics must be comma-separated string'),
  query('companies').optional().isString().withMessage('Companies must be comma-separated string')
];

const validateSubmission = [
  body('problemId').isInt({ min: 1 }).withMessage('Valid problem ID required'),
  body('status').isIn(['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compile Error'])
    .withMessage('Invalid submission status'),
  body('runtime').isInt({ min: 0 }).withMessage('Runtime must be positive integer'),
  body('memory').isFloat({ min: 0 }).withMessage('Memory must be positive number'),
  body('language').isString().isLength({ min: 1, max: 50 }).withMessage('Valid language required'),
  body('submissionTime').isISO8601().withMessage('Valid ISO date required for submission time')
];

// Middleware to handle validation errors
const handleValidationErrors = (req: Request, res: Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: errors.array()
      }
    });
  }
  next();
};

/**
 * GET /api/v1/progress/:userId
 * Get comprehensive progress data for a user
 */
router.get(
  '/:userId',
  requireConfigMiddleware,
  validateUserId,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Verify user has access to this data (user can only access their own progress)
    if (req.userConfig?.email !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own progress data'
        }
      });
    }

    console.log(`Fetching progress for user: ${userId}`);

    const progressData = await progressService.getUserProgress(userId);

    // Set cache headers for progress data
    res.set({
      'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      'ETag': `"${Buffer.from(JSON.stringify(progressData)).toString('base64').slice(0, 32)}"`
    });

    return res.status(200).json(createApiResponse(true, progressData));
  })
);

/**
 * POST /api/v1/progress/:userId/submissions
 * Add a new submission for the user
 */
router.post(
  '/:userId/submissions',
  requireConfigMiddleware,
  validateUserId,
  validateSubmission,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const submissionData = req.body;

      // Verify user has access to update this data
      if (req.userConfig?.email !== userId) {
        return res.status(403).json(createApiResponse(
          false,
          undefined,
          {
            code: 'ACCESS_DENIED',
            message: 'You can only update your own progress data'
          }
        ));
      }

      // Create submission object with generated ID
      const submission: UserSubmission = {
        ...submissionData,
        submissionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        runtimePercentile: Math.random(), // In real implementation, this would be calculated
        memoryPercentile: Math.random()
      };

      console.log(`Adding submission for user: ${userId}, problem: ${submission.problemId}`);

      await progressService.updateUserProgress(userId, submission);

      return res.status(201).json(createApiResponse(
        true,
        { submissionId: submission.submissionId, message: 'Submission recorded successfully' }
      ));

    } catch (error) {
      console.error('Error recording submission:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        {
          code: 'INTERNAL_ERROR',
          message: 'Failed to record submission',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        }
      ));
    }
  }
);

/**
 * GET /api/v1/progress/problems/topic/:topic
 * Get problems by topic
 */
router.get(
  '/problems/topic/:topic',
  requireConfigMiddleware,
  [param('topic').isString().isLength({ min: 1, max: 50 }).withMessage('Valid topic name required')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { topic } = req.params;
      const { difficulty } = req.query;

      console.log(`Fetching problems for topic: ${topic}, difficulty: ${difficulty || 'all'}`);

      const problems = await progressService.getProblemsByTopic(
        topic,
        difficulty as string | undefined
      );

      // Set cache headers for problem data
      res.set({
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'ETag': `"topic-${topic}-${difficulty || 'all'}"`
      });

      return res.status(200).json(createApiResponse(true, problems, undefined, false));

    } catch (error) {
      console.error('Error fetching problems by topic:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch problems by topic'
        }
      ));
    }
  }
);

/**
 * GET /api/v1/progress/problems/company/:company
 * Get problems by company
 */
router.get(
  '/problems/company/:company',
  requireConfigMiddleware,
  [param('company').isString().isLength({ min: 1, max: 50 }).withMessage('Valid company name required')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { company } = req.params;
      const { difficulty } = req.query;

      console.log(`Fetching problems for company: ${company}, difficulty: ${difficulty || 'all'}`);

      const problems = await progressService.getProblemsByCompany(
        company,
        difficulty as string | undefined
      );

      // Set cache headers for problem data
      res.set({
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'ETag': `"company-${company}-${difficulty || 'all'}"`
      });

      return res.status(200).json(createApiResponse(true, problems, undefined, false));

    } catch (error) {
      console.error('Error fetching problems by company:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch problems by company'
        }
      ));
    }
  }
);

/**
 * GET /api/v1/progress/:userId/recommendations
 * Get problem recommendations for user
 */
router.get(
  '/:userId/recommendations',
  requireConfigMiddleware,
  validateUserId,
  [query('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const count = parseInt(req.query.count as string) || 5;

      // Verify user has access to this data
      if (req.userConfig?.email !== userId) {
        return res.status(403).json(createApiResponse(
          false,
          undefined,
          {
            code: 'ACCESS_DENIED',
            message: 'You can only access your own recommendations'
          }
        ));
      }

      console.log(`Fetching recommendations for user: ${userId}, count: ${count}`);

      const recommendations = await progressService.getRecommendations(userId, count);

      // Set cache headers for recommendations
      res.set({
        'Cache-Control': 'private, max-age=600', // Cache for 10 minutes
        'ETag': `"rec-${userId}-${count}"`
      });

      return res.status(200).json(createApiResponse(true, recommendations));

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch recommendations'
        }
      ));
    }
  }
);

/**
 * GET /api/v1/progress/problems/search
 * Search problems with filters
 */
router.get(
  '/problems/search',
  requireConfigMiddleware,
  [
    query('q').isString().isLength({ min: 1, max: 100 }).withMessage('Search query required'),
    ...validateProblemFilters
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { q: query } = req.query;
      const filters: ProblemFilters = {};

      // Parse filters from query parameters
      if (req.query.difficulty) {
        filters.difficulty = (req.query.difficulty as string).split(',') as ('Easy' | 'Medium' | 'Hard')[];
      }
      if (req.query.topics) {
        filters.topics = (req.query.topics as string).split(',');
      }
      if (req.query.companies) {
        filters.companies = (req.query.companies as string).split(',');
      }
      if (req.query.isPaid !== undefined) {
        filters.isPaid = req.query.isPaid === 'true';
      }
      if (req.query.minAcceptanceRate) {
        filters.minAcceptanceRate = parseFloat(req.query.minAcceptanceRate as string);
      }
      if (req.query.maxAcceptanceRate) {
        filters.maxAcceptanceRate = parseFloat(req.query.maxAcceptanceRate as string);
      }

      console.log(`Searching problems with query: ${query}, filters:`, filters);

      const results = await progressService.searchProblems(query as string, filters);

      // Set cache headers for search results
      res.set({
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'ETag': `"search-${Buffer.from(JSON.stringify({ query, filters })).toString('base64').slice(0, 32)}"`
      });

      return res.status(200).json(createApiResponse(true, results));

    } catch (error) {
      console.error('Error searching problems:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search problems'
        }
      ));
    }
  }
);

/**
 * GET /api/v1/progress/health
 * Health check endpoint for progress service
 */
router.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json(createApiResponse(
    true,
    {
      status: 'healthy',
      service: 'progress-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  ));
});

/**
 * GET /api/v1/progress/metrics
 * Error metrics endpoint for monitoring
 */
router.get('/metrics', requireConfigMiddleware, (_req: Request, res: Response) => {
  return res.status(200).json(createApiResponse(
    true,
    { service: 'progress-api', status: 'operational' }
  ));
});

// Error handling is done by the main app error handler

export { router as progressRouter };