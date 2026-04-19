// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    fullyParallel: false,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://localhost:8181',
        browserName: 'chromium',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'mobile-portrait',
            use: {
                browserName: 'chromium',
                viewport: { width: 390, height: 844 },
                deviceScaleFactor: 3,
                isMobile: true,
                hasTouch: true,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            },
        },
        {
            name: 'mobile-landscape',
            use: {
                browserName: 'chromium',
                viewport: { width: 844, height: 390 },
                deviceScaleFactor: 3,
                isMobile: true,
                hasTouch: true,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            },
        },
        {
            name: 'desktop',
            use: {
                browserName: 'chromium',
                viewport: { width: 1280, height: 800 },
                isMobile: false,
                hasTouch: false,
            },
        },
        {
            name: 'tablet-portrait',
            use: {
                browserName: 'chromium',
                viewport: { width: 768, height: 1024 },
                deviceScaleFactor: 2,
                isMobile: true,
                hasTouch: true,
            },
        },
    ],
    webServer: {
        command: 'npx http-server . -p 8181 --silent',
        url: 'http://localhost:8181',
        reuseExistingServer: true,
        timeout: 10000,
    },
});
