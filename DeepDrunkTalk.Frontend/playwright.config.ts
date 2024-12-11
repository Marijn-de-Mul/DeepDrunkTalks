import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
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
