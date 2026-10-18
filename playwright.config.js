import { defineConfig } from '@playwright/test'

const device = (name, browserName, width, height, touch = true) => ({
  name,
  use: { browserName, viewport: { width, height }, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 },
})

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: { timeout: 10000 },
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5100',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5100',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    device('small-phone', 'chromium', 320, 568),
    device('iphone-se', 'webkit', 375, 667),
    device('iphone', 'webkit', 393, 852),
    device('android', 'chromium', 412, 915),
    device('phone-landscape', 'chromium', 915, 412),
    device('ipad-mini', 'webkit', 768, 1024),
    device('ipad-air', 'webkit', 820, 1180),
    device('ipad-landscape', 'webkit', 1180, 820),
    device('desktop', 'chromium', 1440, 900, false),
    device('wide-desktop', 'chromium', 1920, 1080, false),
  ],
})
