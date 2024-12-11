import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  await page.goto('http://localhost:5173/login');

  await page.fill('[data-testid="login-emailinput"]', 'test@test.nl');
  await page.fill('[data-testid="login-passwordinput"]', 'test');
  await page.click('[data-testid="login-button"]');

  await page.waitForURL('http://localhost:5173/');
  const cookies = await context.cookies();
  await context.addCookies(cookies); 

  page.on('request', (request) => console.log('>>', request.method(), request.url()));
  page.on('response', (response) => console.log('<<', response.status(), response.url()));
});

test('[Conversations] Test if page loads', async ({ page }) => {
  await page.goto('http://localhost:5173/conversations');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Conversations/);

  await expect(page.getByTestId('conversations-header')).toBeVisible();
  await expect(page.getByTestId('conversations-list')).toBeVisible();
});

test('[Conversations] Test if conversations display correctly', async ({ page }) => {
  await page.goto('http://localhost:5173/conversations');

  await expect(page.getByTestId('loader')).toBeVisible();
  await expect(page.getByTestId('loader')).not.toBeVisible();

  await expect(page.getByTestId('conversations-list')).toBeVisible();

  const conversationItems = page.locator('[data-testid="conversations-item"]');
  const itemCount = await conversationItems.count();

  if (itemCount === 0) {
    await expect(page.getByTestId('conversations-empty-message')).toBeVisible();
    await expect(page.getByTestId('conversations-empty-message')).toHaveText(/no conversations available/i);
  } else {
    const firstItem = conversationItems.first();
    await expect(firstItem).toBeVisible();
    await expect(firstItem).toHaveText(/.+/); 
  }
});

// test('[Conversations] Test delete functionality', async ({ page }) => {
//   await page.goto('http://localhost:5173/conversations');

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
