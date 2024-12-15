import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  // Log all requests and responses for debugging
  page.on('request', (request) => console.log('>>', request.method(), request.url()));
  page.on('response', (response) => console.log('<<', response.status(), response.url()));

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
});

test('[Main Menu] Test if page loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Main Menu/);

  await expect(page.getByTestId('mainmenu-logo')).toBeVisible();
  await expect(page.getByTestId('mainmenu-logo-container')).toBeVisible();
  await expect(page.getByTestId('mainmenu-button-container')).toBeVisible();
});

test('[Main Menu] Test if all buttons are visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('mainmenu-button-play')).toBeVisible();
  await expect(page.getByTestId('mainmenu-button-conversations')).toBeVisible();
  await expect(page.getByTestId('mainmenu-button-settings')).toBeVisible();
  await expect(page.getByTestId('mainmenu-button-logout')).toBeVisible();
});

test('[Main Menu] Test navigation to Play page', async ({ page }) => {
  await page.goto('/');

  await page.click('[data-testid="mainmenu-button-play"]');
  await expect(page).toHaveURL('/play');
});

test('[Main Menu] Test navigation to Conversations page', async ({ page }) => {
  await page.goto('/');

  await page.click('[data-testid="mainmenu-button-conversations"]');
  await expect(page).toHaveURL('/conversations');
});

test('[Main Menu] Test navigation to Settings page', async ({ page }) => {
  await page.goto('/');

  await page.click('[data-testid="mainmenu-button-settings"]');
  await expect(page).toHaveURL('/settings');
});

test('[Main Menu] Test logout functionality', async ({ page }) => {
  await page.goto('/');

  await page.click('[data-testid="mainmenu-button-logout"]');

  await expect(page).toHaveURL('/login');
});
