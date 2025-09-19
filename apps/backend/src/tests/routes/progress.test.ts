/**
 * Integration tests for Progress API endpoints
 */

import request from 'supertest';
import { app } from '../../index';
import { UserConfig } from '../../middleware/cookieConfig';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'ai-interview-secret-key-2024';
const COOKIE_NAME = 'ai-interview-config';

describe('Progress API Integration Tests', () => {
  let authCookie: string;
  const testUser: UserConfig = {
    email: 'test@example.com',
    password: 'testpassword123',
    provider: 'openai',
    model: 'gpt-4',
    apiKey: 'test-api-key',
    apiUrl: 'http://localhost:3003',
    setupComplete: true,
    createdAt: new Date().toISOString()
  };

  beforeAll(async () => {
    // Create encrypted cookie for authentication
    authCookie = createAuthCookie(testUser);
  });

  describe('Authentication & Authorization', () => {
    test('should reject requests without authentication cookie', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFIGURATION_REQUIRED');
    });

    test('should reject requests with invalid cookie', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com')
        .set('Cookie', [`${COOKIE_NAME}=invalid-cookie`])
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject requests to access other user data', async () => {
      const response = await request(app)
        .get('/api/v1/progress/other@example.com')
        .set('Cookie', [authCookie])
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('GET /api/v1/progress/:userId', () => {
    test('should return user progress data', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      const progress = response.body.data;
      expect(progress.userId).toBe('test@example.com');
      expect(progress.lastUpdated).toBeDefined();
      expect(progress.overallStats).toBeDefined();
      expect(progress.topicProgress).toBeDefined();
      expect(progress.companyProgress).toBeDefined();
      expect(progress.recentActivity).toBeDefined();
      expect(progress.weakestTopics).toBeDefined();
      expect(progress.strongestTopics).toBeDefined();
      expect(progress.nextRecommendations).toBeDefined();
      expect(progress.streakInfo).toBeDefined();

      // Validate API response metadata
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.timestamp).toBeDefined();
      expect(response.body.meta.requestId).toBeDefined();
      expect(response.body.meta.version).toBe('v1');
    });

    test('should set appropriate cache headers', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.headers['cache-control']).toContain('private');
      expect(response.headers['etag']).toBeDefined();
    });

    test('should validate userId parameter', async () => {
      const response = await request(app)
        .get('/api/v1/progress/invalid-email')
        .set('Cookie', [authCookie])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/progress/:userId/submissions', () => {
    const validSubmission = {
      problemId: 1,
      status: 'Accepted',
      runtime: 100,
      memory: 15.5,
      submissionTime: new Date().toISOString(),
      language: 'JavaScript'
    };

    test('should accept valid submission', async () => {
      const response = await request(app)
        .post('/api/v1/progress/test@example.com/submissions')
        .set('Cookie', [authCookie])
        .send(validSubmission)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.submissionId).toBeDefined();
      expect(response.body.data.message).toBe('Submission recorded successfully');
    });

    test('should validate submission data', async () => {
      const invalidSubmission = {
        problemId: 'invalid',
        status: 'InvalidStatus',
        runtime: -100,
        memory: 'invalid',
        language: ''
      };

      const response = await request(app)
        .post('/api/v1/progress/test@example.com/submissions')
        .set('Cookie', [authCookie])
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    test('should require all mandatory fields', async () => {
      const incompleteSubmission = {
        problemId: 1,
        status: 'Accepted'
        // Missing runtime, memory, submissionTime, language
      };

      const response = await request(app)
        .post('/api/v1/progress/test@example.com/submissions')
        .set('Cookie', [authCookie])
        .send(incompleteSubmission)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/progress/problems/topic/:topic', () => {
    test('should return problems by topic', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/topic/Array')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((problem: any) => {
        expect(problem.topics).toContain('Array');
        expect(problem.id).toBeDefined();
        expect(problem.title).toBeDefined();
        expect(problem.difficulty).toBeDefined();
      });
    });

    test('should filter by difficulty when provided', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/topic/Array?difficulty=Easy')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((problem: any) => {
        expect(problem.topics).toContain('Array');
        expect(problem.difficulty).toBe('Easy');
      });
    });

    test('should validate topic parameter', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/topic/')
        .set('Cookie', [authCookie])
        .expect(404); // Should hit Express's default 404 handler
    });

    test('should set public cache headers for problem data', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/topic/Array')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.headers['cache-control']).toContain('public');
    });
  });

  describe('GET /api/v1/progress/problems/company/:company', () => {
    test('should return problems by company', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/company/Google')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((problem: any) => {
        expect(problem.companies).toContain('Google');
      });
    });

    test('should filter by difficulty when provided', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/company/Google?difficulty=Medium')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((problem: any) => {
        expect(problem.companies).toContain('Google');
        expect(problem.difficulty).toBe('Medium');
      });
    });
  });

  describe('GET /api/v1/progress/:userId/recommendations', () => {
    test('should return problem recommendations', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com/recommendations')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5); // Default count

      response.body.data.forEach((rec: any) => {
        expect(rec.problem).toBeDefined();
        expect(rec.reason).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.estimatedDifficulty).toBeDefined();
        expect(rec.topics).toBeDefined();
        expect(rec.expectedLearning).toBeDefined();
      });
    });

    test('should respect count parameter', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com/recommendations?count=3')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    test('should validate count parameter', async () => {
      const response = await request(app)
        .get('/api/v1/progress/test@example.com/recommendations?count=100')
        .set('Cookie', [authCookie])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/progress/problems/search', () => {
    test('should search problems by query', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/search?q=array')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((problem: any) => {
        const matchesQuery =
          problem.title.toLowerCase().includes('array') ||
          problem.topics.some((topic: string) => topic.toLowerCase().includes('array'));
        expect(matchesQuery).toBe(true);
      });
    });

    test('should apply multiple filters', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/search?q=test&difficulty=Easy,Medium&isPaid=false')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((problem: any) => {
        expect(['Easy', 'Medium']).toContain(problem.difficulty);
        expect(problem.isPaid).toBe(false);
      });
    });

    test('should require search query', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/search')
        .set('Cookie', [authCookie])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should validate filter parameters', async () => {
      const response = await request(app)
        .get('/api/v1/progress/problems/search?q=test&minAcceptanceRate=2')
        .set('Cookie', [authCookie])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Health and Monitoring', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/progress/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.service).toBe('progress-api');
      expect(response.body.data.uptime).toBeDefined();
      expect(response.body.data.version).toBe('v1');
      expect(response.body.data.errorMetrics).toBeDefined();
    });

    test('should return error metrics for authenticated users', async () => {
      const response = await request(app)
        .get('/api/v1/progress/metrics')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.timeWindow).toBeDefined();
      expect(response.body.data.errorCounts).toBeDefined();
      expect(response.body.data.totalErrors).toBeDefined();
    });

    test('should require authentication for metrics endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/progress/metrics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .get('/api/v1/progress/test@example.com')
          .set('Cookie', [authCookie])
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    // Note: Testing actual rate limiting would require making 100+ requests
    // which is not practical in unit tests. Rate limiting should be tested
    // separately in load tests.
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // This test would require mocking the service to throw an error
      // For now, we'll test that error responses have the correct format
      const response = await request(app)
        .get('/api/v1/progress/invalid-user-id')
        .set('Cookie', [authCookie])
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBeDefined();
      expect(response.body.error.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.requestId).toBeDefined();
    });

    test('should include request ID in error responses', async () => {
      const response = await request(app)
        .get('/api/v1/progress/invalid-email')
        .set('Cookie', [authCookie])
        .expect(400);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body.meta.requestId).toBeDefined();
    });
  });

  describe('Response Format Consistency', () => {
    test('should have consistent API response format', async () => {
      const endpoints = [
        '/api/v1/progress/test@example.com',
        '/api/v1/progress/problems/topic/Array',
        '/api/v1/progress/problems/company/Google',
        '/api/v1/progress/test@example.com/recommendations',
        '/api/v1/progress/health'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Cookie', [authCookie]);

        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('meta');
        expect(response.body.meta).toHaveProperty('timestamp');
        expect(response.body.meta).toHaveProperty('requestId');
        expect(response.body.meta).toHaveProperty('version');

        if (response.body.success) {
          expect(response.body).toHaveProperty('data');
        } else {
          expect(response.body).toHaveProperty('error');
        }
      }
    });
  });
});

/**
 * Helper function to create authenticated cookie
 */
function createAuthCookie(userConfig: UserConfig): string {
  try {
    // Encrypt the configuration
    const configToEncrypt = {
      ...userConfig,
      password: CryptoJS.AES.encrypt(userConfig.password, ENCRYPTION_KEY).toString(),
      apiKey: CryptoJS.AES.encrypt(userConfig.apiKey, ENCRYPTION_KEY).toString()
    };

    const configString = JSON.stringify(configToEncrypt);
    const encrypted = CryptoJS.AES.encrypt(configString, ENCRYPTION_KEY).toString();

    return `${COOKIE_NAME}=${encrypted}; Path=/; HttpOnly; SameSite=Strict`;
  } catch (error) {
    throw new Error('Failed to create auth cookie');
  }
}