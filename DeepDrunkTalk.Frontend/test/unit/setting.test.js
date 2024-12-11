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

test('[Settings] Test if page loads', async ({ page }) => {
  await page.goto('http://localhost:5173/settings');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Settings/);

  await expect(page.getByTestId('setting-title')).toBeVisible();
  await expect(page.getByTestId('setting-volume-slider')).toBeVisible();
  await expect(page.getByTestId('setting-refresh-slider')).toBeVisible();
});

test('[Settings] Test loading settings from server', async ({ page }) => {
  await page.goto('http://localhost:5173/settings');

  await expect(page.getByTestId('setting-loading-state')).toBeVisible();

  await expect(page.getByTestId('setting-loading-state')).not.toBeVisible();
  await expect(page.getByTestId('setting-volume-slider')).toBeVisible();
  await expect(page.getByTestId('setting-refresh-slider')).toBeVisible();
});

test('[Settings] Test if settings elements are visible and functional', async ({ page }) => {
  await page.goto('http://localhost:5173/settings');

  await expect(page.getByTestId('setting-volume-slider')).toBeVisible();
  await page.getByTestId('setting-volume-slider').click({ position: { x: 75, y: 10 } }); 
  await expect(page.getByTestId('setting-volume-value')).toHaveText('Current Volume: 20%');

  await expect(page.getByTestId('setting-refresh-slider')).toBeVisible();
  await page.getByTestId('setting-refresh-slider').click({ position: { x: 70, y: 10 } }); 
  await expect(page.getByTestId('setting-refresh-value')).toHaveText('Current Refresh Frequency: 3 minutes');
});

test('[Settings] Test saving settings', async ({ page }) => {
  await page.goto('http://localhost:5173/settings');

  await expect(page.getByTestId('setting-loading-state')).not.toBeVisible();

  await expect(page.getByTestId('setting-volume-slider')).toBeVisible();
  await page.getByTestId('setting-volume-slider').click({ position: { x: 75, y: 10 } }); 
  await expect(page.getByTestId('setting-volume-value')).toHaveText('Current Volume: 20%');

  await expect(page.getByTestId('setting-refresh-slider')).toBeVisible();
  await page.getByTestId('setting-refresh-slider').click({ position: { x: 70, y: 10 } }); 

  const saveButton = page.getByTestId('setting-save-settings-button');
  await saveButton.click();

  page.on('response', async (response) => {
    if (response.url().includes('/api/users/settings') && response.status() === 200) {
      console.log('Settings saved successfully');
    }
  });
});
