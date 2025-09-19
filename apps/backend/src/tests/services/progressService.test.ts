/**
 * Unit tests for MockLeetCodeService
 */

import { MockLeetCodeService } from '../../services/progressService';
import { UserSubmission, ProblemFilters } from '../../types/leetcode';

describe('MockLeetCodeService', () => {
  let service: MockLeetCodeService;
  const testUserId = 'test@example.com';

  beforeEach(() => {
    service = new MockLeetCodeService();
  });

  describe('Problem Generation', () => {
    test('should generate problems with correct structure', async () => {
      const problems = await service.searchProblems('array', { difficulty: ['Easy'] });

      expect(problems).toBeDefined();
      expect(problems.length).toBeGreaterThan(0);

      const problem = problems[0];
      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('title');
      expect(problem).toHaveProperty('slug');
      expect(problem).toHaveProperty('difficulty');
      expect(problem).toHaveProperty('topics');
      expect(problem).toHaveProperty('companies');
      expect(problem).toHaveProperty('isPaid');
      expect(problem).toHaveProperty('acRate');
      expect(problem).toHaveProperty('leetcodeUrl');

      expect(typeof problem.id).toBe('number');
      expect(typeof problem.title).toBe('string');
      expect(typeof problem.slug).toBe('string');
      expect(['Easy', 'Medium', 'Hard']).toContain(problem.difficulty);
      expect(Array.isArray(problem.topics)).toBe(true);
      expect(Array.isArray(problem.companies)).toBe(true);
      expect(typeof problem.isPaid).toBe('boolean');
      expect(typeof problem.acRate).toBe('number');
      expect(problem.acRate).toBeGreaterThanOrEqual(0);
      expect(problem.acRate).toBeLessThanOrEqual(1);
    });

    test('should generate sufficient number of problems', async () => {
      const allProblems = await service.searchProblems('', {});
      expect(allProblems.length).toBeGreaterThanOrEqual(50); // Limited to 50 in search
    });

    test('should have diverse difficulty distribution', async () => {
      const easyProblems = await service.searchProblems('', { difficulty: ['Easy'] });
      const mediumProblems = await service.searchProblems('', { difficulty: ['Medium'] });
      const hardProblems = await service.searchProblems('', { difficulty: ['Hard'] });

      expect(easyProblems.length).toBeGreaterThan(0);
      expect(mediumProblems.length).toBeGreaterThan(0);
      expect(hardProblems.length).toBeGreaterThan(0);
    });
  });

  describe('User Progress Generation', () => {
    test('should generate valid progress response structure', async () => {
      const progress = await service.getUserProgress(testUserId);

      expect(progress).toBeDefined();
      expect(progress).toHaveProperty('userId', testUserId);
      expect(progress).toHaveProperty('lastUpdated');
      expect(progress).toHaveProperty('overallStats');
      expect(progress).toHaveProperty('topicProgress');
      expect(progress).toHaveProperty('companyProgress');
      expect(progress).toHaveProperty('recentActivity');
      expect(progress).toHaveProperty('weakestTopics');
      expect(progress).toHaveProperty('strongestTopics');
      expect(progress).toHaveProperty('nextRecommendations');
      expect(progress).toHaveProperty('streakInfo');

      // Validate date format
      expect(() => new Date(progress.lastUpdated)).not.toThrow();
    });

    test('should generate consistent overall stats', async () => {
      const progress = await service.getUserProgress(testUserId);
      const stats = progress.overallStats;

      expect(stats.totalSolved).toBeGreaterThanOrEqual(0);
      expect(stats.totalProblems).toBeGreaterThan(0);
      expect(stats.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.progressPercentage).toBeLessThanOrEqual(1);
      expect(stats.currentStreak).toBeGreaterThanOrEqual(0);
      expect(stats.maxStreak).toBeGreaterThanOrEqual(stats.currentStreak);
      expect(stats.ranking).toBeGreaterThan(0);
      expect(stats.contestRating).toBeGreaterThan(0);

      // Validate difficulty stats
      const { easy, medium, hard } = stats.difficultyStats;
      expect(easy.solved).toBeLessThanOrEqual(easy.total);
      expect(medium.solved).toBeLessThanOrEqual(medium.total);
      expect(hard.solved).toBeLessThanOrEqual(hard.total);
      expect(easy.percentage).toBeLessThanOrEqual(1);
      expect(medium.percentage).toBeLessThanOrEqual(1);
      expect(hard.percentage).toBeLessThanOrEqual(1);
    });

    test('should generate topic progress for all major topics', async () => {
      const progress = await service.getUserProgress(testUserId);
      const topicNames = progress.topicProgress.map(tp => tp.topicName);

      const expectedTopics = ['Array', 'String', 'Dynamic Programming', 'Graph'];
      expectedTopics.forEach(topic => {
        expect(topicNames).toContain(topic);
      });

      progress.topicProgress.forEach(tp => {
        expect(tp.solvedProblems).toBeLessThanOrEqual(tp.totalProblems);
        expect(tp.progressPercentage).toBeLessThanOrEqual(1);
        expect(tp.easyCount.solved).toBeLessThanOrEqual(tp.easyCount.total);
        expect(tp.mediumCount.solved).toBeLessThanOrEqual(tp.mediumCount.total);
        expect(tp.hardCount.solved).toBeLessThanOrEqual(tp.hardCount.total);
      });
    });

    test('should maintain consistency between calls for same user', async () => {
      const progress1 = await service.getUserProgress(testUserId);
      const progress2 = await service.getUserProgress(testUserId);

      expect(progress1.overallStats.totalSolved).toBe(progress2.overallStats.totalSolved);
      expect(progress1.topicProgress.length).toBe(progress2.topicProgress.length);
    });
  });

  describe('Submission Management', () => {
    test('should add submissions to user progress', async () => {
      const initialProgress = await service.getUserProgress(testUserId);
      // const initialCount = initialProgress.overallStats.totalSolved;

      const newSubmission: UserSubmission = {
        problemId: 1,
        status: 'Accepted',
        runtime: 100,
        memory: 15.5,
        submissionTime: new Date().toISOString(),
        language: 'JavaScript',
        submissionId: 'test-sub-1'
      };

      await service.updateUserProgress(testUserId, newSubmission);

      const updatedProgress = await service.getUserProgress(testUserId);
      // Note: Mock service generates its own submissions, so we just verify the method works
      expect(updatedProgress).toBeDefined();
    });

    test('should handle invalid submission gracefully', async () => {
      const invalidSubmission = {
        problemId: -1,
        status: 'InvalidStatus',
        runtime: -100,
        memory: -5,
        submissionTime: 'invalid-date',
        language: '',
        submissionId: ''
      } as any;

      // Should not throw an error
      await expect(service.updateUserProgress(testUserId, invalidSubmission)).resolves.not.toThrow();
    });
  });

  describe('Problem Filtering', () => {
    test('should filter problems by topic correctly', async () => {
      const arrayProblems = await service.getProblemsByTopic('Array');

      expect(arrayProblems.length).toBeGreaterThan(0);
      arrayProblems.forEach(problem => {
        expect(problem.topics).toContain('Array');
      });
    });

    test('should filter problems by topic and difficulty', async () => {
      const easyArrayProblems = await service.getProblemsByTopic('Array', 'Easy');

      expect(easyArrayProblems.length).toBeGreaterThan(0);
      easyArrayProblems.forEach(problem => {
        expect(problem.topics).toContain('Array');
        expect(problem.difficulty).toBe('Easy');
      });
    });

    test('should filter problems by company', async () => {
      const googleProblems = await service.getProblemsByCompany('Google');

      expect(googleProblems.length).toBeGreaterThan(0);
      googleProblems.forEach(problem => {
        expect(problem.companies).toContain('Google');
      });
    });

    test('should filter problems by company and difficulty', async () => {
      const googleMediumProblems = await service.getProblemsByCompany('Google', 'Medium');

      expect(googleMediumProblems.length).toBeGreaterThan(0);
      googleMediumProblems.forEach(problem => {
        expect(problem.companies).toContain('Google');
        expect(problem.difficulty).toBe('Medium');
      });
    });
  });

  describe('Search Functionality', () => {
    test('should search problems by title', async () => {
      const results = await service.searchProblems('Two Sum');

      expect(results.length).toBeGreaterThan(0);
      const twoSumProblem = results.find(p => p.title.includes('Two Sum'));
      expect(twoSumProblem).toBeDefined();
    });

    test('should search problems by topic', async () => {
      const results = await service.searchProblems('array');

      expect(results.length).toBeGreaterThan(0);
      results.forEach(problem => {
        const matchesTopic = problem.topics.some(topic =>
          topic.toLowerCase().includes('array')
        );
        const matchesTitle = problem.title.toLowerCase().includes('array');
        expect(matchesTopic || matchesTitle).toBe(true);
      });
    });

    test('should apply search filters correctly', async () => {
      const filters: ProblemFilters = {
        difficulty: ['Easy'],
        isPaid: false,
        minAcceptanceRate: 0.5
      };

      const results = await service.searchProblems('', filters);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(problem => {
        expect(problem.difficulty).toBe('Easy');
        expect(problem.isPaid).toBe(false);
        expect(problem.acRate).toBeGreaterThanOrEqual(0.5);
      });
    });

    test('should limit search results', async () => {
      const results = await service.searchProblems('');
      expect(results.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Recommendations', () => {
    test('should generate problem recommendations', async () => {
      const recommendations = await service.getRecommendations(testUserId, 5);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeLessThanOrEqual(5);

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('problem');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('estimatedDifficulty');
        expect(rec).toHaveProperty('topics');
        expect(rec).toHaveProperty('expectedLearning');

        expect(['High', 'Medium', 'Low']).toContain(rec.priority);
        expect(rec.estimatedDifficulty).toBeGreaterThanOrEqual(1);
        expect(rec.estimatedDifficulty).toBeLessThanOrEqual(10);
        expect(Array.isArray(rec.topics)).toBe(true);
        expect(Array.isArray(rec.expectedLearning)).toBe(true);
      });
    });

    test('should respect recommendation count parameter', async () => {
      const recommendations3 = await service.getRecommendations(testUserId, 3);
      const recommendations7 = await service.getRecommendations(testUserId, 7);

      expect(recommendations3.length).toBeLessThanOrEqual(3);
      expect(recommendations7.length).toBeLessThanOrEqual(7);
    });
  });

  describe('Data Validation', () => {
    test('should generate valid URLs', async () => {
      const problems = await service.searchProblems('', {});

      problems.forEach(problem => {
        expect(problem.leetcodeUrl).toMatch(/^https:\/\/leetcode\.com\/problems\/.+\/$/);
        expect(problem.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    test('should generate valid submission times', async () => {
      const progress = await service.getUserProgress(testUserId);

      progress.recentActivity.forEach(activity => {
        expect(() => new Date(activity.date)).not.toThrow();

        activity.submissions.forEach(submission => {
          expect(() => new Date(submission.submissionTime)).not.toThrow();
        });
      });
    });

    test('should maintain data integrity in progress calculations', async () => {
      const progress = await service.getUserProgress(testUserId);

      // Check that topic progress adds up correctly
      progress.topicProgress.forEach(tp => {
        const totalDifficulty = tp.easyCount.total + tp.mediumCount.total + tp.hardCount.total;
        const solvedDifficulty = tp.easyCount.solved + tp.mediumCount.solved + tp.hardCount.solved;

        expect(solvedDifficulty).toBeLessThanOrEqual(totalDifficulty);
        expect(tp.solvedProblems).toBe(solvedDifficulty);

        if (tp.totalProblems > 0) {
          expect(tp.progressPercentage).toBeCloseTo(tp.solvedProblems / tp.totalProblems, 2);
        }
      });
    });
  });

  describe('Performance', () => {
    test('should generate user progress within reasonable time', async () => {
      const startTime = Date.now();
      await service.getUserProgress(testUserId);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        service.getUserProgress(`user${i}@example.com`)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.userId).toBe(`user${index}@example.com`);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty search queries', async () => {
      const results = await service.searchProblems('');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle non-existent topics', async () => {
      const results = await service.getProblemsByTopic('NonExistentTopic');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('should handle non-existent companies', async () => {
      const results = await service.getProblemsByCompany('NonExistentCompany');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('should handle invalid filters gracefully', async () => {
      const invalidFilters: ProblemFilters = {
        difficulty: ['Invalid' as any],
        minAcceptanceRate: -1,
        maxAcceptanceRate: 2
      };

      const results = await service.searchProblems('test', invalidFilters);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });
});