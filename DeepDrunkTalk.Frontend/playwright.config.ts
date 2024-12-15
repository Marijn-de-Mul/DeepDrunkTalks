import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 2,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  workers: 16, 
  
  use: {
    baseURL: (() => {
      switch (process.env.NODE_ENV) {
        case 'production':
          return 'https://ddt.fhict.marijndemul.nl';
        case 'test':
          return 'https://ddt.staging.fhict.marijndemul.nl';
        default:
          return 'http://localhost:3000';
      }
    })(),
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Mobile Safari',
      use: {

        ignoreHTTPSErrors: true, 

        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 }, 
        deviceScaleFactor: 3, 
        isMobile: true, 
      },
    },
  ],
});
