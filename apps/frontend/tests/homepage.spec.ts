import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('AI Interview Prep');
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Track Progress')).toBeVisible();
    await expect(page.locator('text=AI Roadmap')).toBeVisible();
    await expect(page.locator('text=Problem Suggestions')).toBeVisible();
  });

  test('should have interactive buttons', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByTestId('get-started-btn')).toBeVisible();
    await expect(page.getByTestId('learn-more-btn')).toBeVisible();
    
    await page.getByTestId('get-started-btn').hover();
    await page.getByTestId('learn-more-btn').hover();
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have theme toggle functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check theme toggle is visible
    const themeToggle = page.locator('button').filter({ hasText: 'Light' });
    await expect(themeToggle).toBeVisible();
    
    // Click theme toggle to open dropdown
    await themeToggle.click();
    
    // Check all theme options are available
    await expect(page.locator('text=☀️').first()).toBeVisible();
    await expect(page.locator('text=🌙').first()).toBeVisible();
    await expect(page.locator('text=🌚').first()).toBeVisible();
    
    // Test switching to night mode
    await page.locator('button').filter({ hasText: 'Night' }).click();
    
    // Verify theme changed to night mode
    await expect(page.locator('html')).toHaveClass(/night/);
    
    // Test switching to dark mode
    await page.locator('button').filter({ hasText: 'Night' }).click();
    await page.locator('button').filter({ hasText: 'Dark' }).click();
    
    // Verify theme changed to dark mode
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should persist theme preference', async ({ page }) => {
    await page.goto('/');
    
    // Switch to night mode
    await page.locator('button').filter({ hasText: 'Light' }).click();
    await page.locator('button').filter({ hasText: 'Night' }).click();
    
    // Reload page
    await page.reload();
    
    // Check that night mode is still active
    await expect(page.locator('html')).toHaveClass(/night/);
    await expect(page.locator('button').filter({ hasText: 'Night' })).toBeVisible();
  });
});