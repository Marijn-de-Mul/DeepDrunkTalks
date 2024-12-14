import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));
});

test('[Register] Test if page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/register');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Register/);

  await expect(page.getByTestId('register-logo')).toBeVisible();
  await expect(page.getByTestId('register-header')).toBeVisible();
  await expect(page.getByTestId('register-form')).toBeDefined();
  await expect(page.getByTestId('register-usernameinput')).toBeVisible();
  await expect(page.getByTestId('register-emailinput')).toBeVisible();
  await expect(page.getByTestId('register-passwordinput')).toBeVisible();
  await expect(page.getByTestId('register-confirm-passwordinput')).toBeVisible();
  await expect(page.getByTestId('register-button')).toBeVisible();
  await expect(page.getByTestId('login-button-onregisterscreen')).toBeVisible();
});

test('[Register] Test if registration fails with mismatched passwords', async ({ page }) => {
  await page.goto('http://localhost:3000/register');

  await page.fill('[data-testid="register-usernameinput"]', 'testuser');
  await page.fill('[data-testid="register-emailinput"]', 'testuser@example.com');
  await page.fill('[data-testid="register-passwordinput"]', 'password123');
  await page.fill('[data-testid="register-confirm-passwordinput"]', 'password321');

  await page.click('[data-testid="register-button"]');

  await expect(page.getByTestId('register-error-message')).toBeVisible();
  await expect(page.getByTestId('register-error-message')).toHaveText(/Passwords do not match!/i);
});

test('[Register] Test if registration succeeds with valid data', async ({ page }) => {
  await page.goto('http://localhost:3000/register');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Register/);

  const timestamp = Date.now();
  const uniqueUsername = `user${timestamp}`;
  const uniqueEmail = `user${timestamp}@example.com`;

  await page.fill('[data-testid="register-usernameinput"]', uniqueUsername);
  await page.fill('[data-testid="register-emailinput"]', uniqueEmail);
  await page.fill('[data-testid="register-passwordinput"]', 'password123');
  await page.fill('[data-testid="register-confirm-passwordinput"]', 'password123');

  await page.click('[data-testid="register-button"]');

  await expect(page).toHaveURL('http://localhost:3000/');
});

test('[Register] Test if we are redirected to login page', async ({ page }) => {
  await page.goto('http://localhost:3000/register');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Register/);

  await page.click('[data-testid="login-button-onregisterscreen"]');

  await expect(page).toHaveURL('http://localhost:3000/login');  
});
