import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  // Navigate to the login page using baseURL
  await page.goto('/login');

  // Fill in login credentials
  await page.fill('[data-testid="login-emailinput"]', 'test@test.nl');
  await page.fill('[data-testid="login-passwordinput"]', 'test');
  await page.click('[data-testid="login-button"]');

  // Wait for navigation to the home page
  await page.waitForURL('/');

  // Preserve cookies for authenticated sessions
  const cookies = await context.cookies();
  await context.addCookies(cookies); 

  // Log all requests and responses for debugging
  page.on('request', (request) => console.log('>>', request.method(), request.url()));
  page.on('response', (response) => console.log('<<', response.status(), response.url()));
});

test('[Conversations] Test if page loads', async ({ page }) => {
  // Navigate to the conversations page using baseURL
  await page.goto('/conversations');

  // Verify the page title
  await expect(page).toHaveTitle(/DeepDrunkTalks - Conversations/);

  // Check visibility of key elements
  await expect(page.getByTestId('conversations-header')).toBeVisible();
  await expect(page.getByTestId('conversations-list')).toBeVisible();
});

test('[Conversations] Test if conversations display correctly', async ({ page }) => {
  // Navigate to the conversations page using baseURL
  await page.goto('/conversations');

  // Verify loader visibility during data fetching
  await expect(page.getByTestId('loader')).toBeVisible();
  await expect(page.getByTestId('loader')).not.toBeVisible();

  // Ensure the conversations list is visible after loading
  await expect(page.getByTestId('conversations-list')).toBeVisible();

  // Check the number of conversation items
  const conversationItems = page.locator('[data-testid="conversations-item"]');
  const itemCount = await conversationItems.count();

  if (itemCount === 0) {
    // If no conversations are available, verify the empty state message
    await expect(page.getByTestId('conversations-empty-message')).toBeVisible();
    await expect(page.getByTestId('conversations-empty-message')).toHaveText(/no conversations available/i);
  } else {
    // If conversations exist, verify the first conversation item
    const firstItem = conversationItems.first();
    await expect(firstItem).toBeVisible();
    await expect(firstItem).toHaveText(/.+/); 
  }
});

// Uncomment the following test to verify delete functionality
// test('[Conversations] Test delete functionality', async ({ page }) => {
//   await page.goto('/conversations');

//   await expect(page.getByTestId('loader')).not.toBeVisible();

//   await expect(page.getByTestId('conversations-list')).toBeVisible();

//   const deleteButtons = page.locator('[data-testid="conversations-delete"]');
//   const initialCount = await deleteButtons.count();

//   console.log('Initial count of delete buttons:', initialCount);
//   expect(initialCount).toBeGreaterThan(0); 

//   await deleteButtons.first().click();

//   await expect(async () => {
//     const newCount = await page.locator('[data-testid="conversations-delete"]').count();
//     console.log('New count of delete buttons:', newCount);
//     expect(newCount).toBe(initialCount - 1);
//   }).not.toThrow();
// });
