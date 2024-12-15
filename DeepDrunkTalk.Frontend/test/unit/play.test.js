// import { test, expect } from '@playwright/test';

// test.beforeEach(async ({ page, context }) => {
//   await page.goto('http://localhost:3000/login');

//   await page.fill('[data-testid="login-emailinput"]', 'test@test.nl');
//   await page.fill('[data-testid="login-passwordinput"]', 'test');
//   await page.click('[data-testid="login-button"]');

//   await page.waitForURL('http://localhost:3000/');
//   await context.addCookies(await context.cookies());
// });

// test('[Play] Test if page loads correctly', async ({ page }) => {
//   await page.goto('http://localhost:3000/play');

//   await expect(page.getByTestId('play-logo')).toBeVisible();
//   await expect(page.getByTestId('play-logo-container')).toBeVisible();
//   await expect(page.getByTestId('play-question-container')).toBeVisible();
//   await expect(page.getByTestId('play-footer')).toBeVisible();
//   await expect(page.getByTestId('play-footer-text')).toHaveText(/DeepDrunkTalks - 2024 ©/);
// });

// test('[Play] Test NEXT QUESTION button functionality', async ({ page }) => {
//   await page.goto('http://localhost:3000/play');

//   const initialQuestion = await page.locator('[data-testid="play-question-text"]').innerText();

//   await page.click('[data-testid="play-next-question-button"]');

//   await page.waitForTimeout(1000); 

//   const newQuestion = await page.locator('[data-testid="play-question-text"]').innerText();

//   expect(newQuestion).not.toBe(initialQuestion);
// });

// test('[Play] Test BACK TO MAIN MENU button functionality', async ({ page }) => {
//   await page.goto('http://localhost:3000/play');

//   await page.click('[data-testid="play-back-to-main-menu-button"]');

//   await expect(page).toHaveURL('http://localhost:3000/');
// });

// // test('[Play] Test audio upload after conversation stops', async ({ page }) => {
// //   const requests = [];
  
// //   page.on('request', (request) => {
// //     if (request.url().match(/\/api\/conversations\/\d+\/audio/)) {
// //       requests.push(request);
// //     }
// //   });

// //   await page.goto('http://localhost:3000/play');
// //   await page.waitForTimeout(2000); 
  
// //   await page.click('[data-testid="play-back-to-main-menu-button"]');

// //   await page.waitForTimeout(3000);

// //   expect(requests.length).toBeGreaterThan(0);

// //   expect(requests[0].url()).toMatch(/\/api\/conversations\/\d+\/audio/);
// // });


