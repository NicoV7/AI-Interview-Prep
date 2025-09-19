/**
 * Test setup configuration
 */

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.USE_MOCK_LEETCODE_DATA = 'true';
  process.env.CACHE_ENABLED = 'false';
});

afterAll(() => {
  // Cleanup after all tests
});

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for all tests
jest.setTimeout(10000);