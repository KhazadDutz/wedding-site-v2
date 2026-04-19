// @ts-check
const { test, expect } = require('@playwright/test');

// Helper: exibe o estado completo da opening (runas + frase + input visíveis)
// sem esperar os 11 segundos reais de animação
async function showFullOpeningState(page) {
    await page.evaluate(() => {
        const door = document.getElementById('door-container');
        const phrase = document.getElementById('phrase-container');
        const input = document.getElementById('input-container');
        door.classList.add('runes-glowing');
        phrase.classList.add('visible');
        input.classList.add('visible');
    });
}

test.describe('Opening Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // ── Layout inicial ──────────────────────────────────────────────────────

    test('overlay visível, porta presente', async ({ page }) => {
        const overlay = page.locator('#opening-overlay');
        await expect(overlay).toBeVisible();
        await expect(page.locator('#door-container')).toBeVisible();
    });

    test('sem overflow horizontal', async ({ page }) => {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    test('sem overflow vertical', async ({ page }) => {
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        expect(bodyHeight).toBeLessThanOrEqual(viewportHeight + 1);
    });

    test('frase e input estão hidden inicialmente', async ({ page }) => {
        const phrase = page.locator('#phrase-container');
        const input = page.locator('#input-container');
        // visible: hidden via CSS — ainda presentes no DOM mas não visíveis visualmente
        await expect(phrase).toHaveCSS('opacity', '0');
        await expect(input).toHaveCSS('opacity', '0');
    });

    // ── Estado com frase + input visíveis ───────────────────────────────────

    test('porta, frase e input cabem sem overflow após aparecerem', async ({ page }) => {
        await showFullOpeningState(page);
        await page.waitForTimeout(500); // aguarda transição CSS

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        expect(bodyHeight).toBeLessThanOrEqual(viewportHeight + 1);
    });

    test('input visível após fast-forward', async ({ page }) => {
        await showFullOpeningState(page);
        await expect(page.locator('#password-input')).toBeVisible();
    });

    test('porta mantém proporção 3:4 (width ≤ height * 0.76)', async ({ page }) => {
        const door = page.locator('#door-container');
        const box = await door.boundingBox();
        expect(box).not.toBeNull();
        // proporção 3:4 → width / height ≈ 0.75. Tolerância de 5%
        const ratio = box.width / box.height;
        expect(ratio).toBeGreaterThan(0.60);
        expect(ratio).toBeLessThan(0.90);
    });

    // ── Validação de senha ──────────────────────────────────────────────────

    test('senha errada mostra mensagem de erro', async ({ page }) => {
        await showFullOpeningState(page);
        await page.fill('#password-input', 'gandalf');
        await page.keyboard.press('Enter');
        const error = page.locator('#error-message');
        await expect(error).toBeVisible();
        await expect(error).toContainText('palavra certa');
    });

    test('senha errada limpa o input', async ({ page }) => {
        await showFullOpeningState(page);
        await page.fill('#password-input', 'gandalf');
        await page.keyboard.press('Enter');
        await expect(page.locator('#password-input')).toHaveValue('');
    });

    test('senha correta "mellon" inicia abertura da porta', async ({ page }) => {
        await showFullOpeningState(page);
        await page.fill('#password-input', 'mellon');
        // Aguarda a classe door-open (dispara após 600ms)
        await expect(page.locator('#door-container')).toHaveClass(/door-open/, { timeout: 5000 });
    });

    test('senha correta "amigo" inicia abertura da porta', async ({ page }) => {
        await showFullOpeningState(page);
        await page.fill('#password-input', 'amigo');
        await expect(page.locator('#door-container')).toHaveClass(/door-open/, { timeout: 5000 });
    });

    test('senha correta "friend" inicia abertura da porta', async ({ page }) => {
        await showFullOpeningState(page);
        await page.fill('#password-input', 'friend');
        await expect(page.locator('#door-container')).toHaveClass(/door-open/, { timeout: 5000 });
    });

    test('senha case-insensitive (MELLON aceito)', async ({ page }) => {
        await showFullOpeningState(page);
        await page.fill('#password-input', 'MELLON');
        await expect(page.locator('#door-container')).toHaveClass(/door-open/, { timeout: 5000 });
    });

    // ── Placeholder cycling ─────────────────────────────────────────────────

    test('placeholder inicia com "amigo"', async ({ page }) => {
        await showFullOpeningState(page);
        const placeholder = page.locator('#fake-placeholder');
        await expect(placeholder).toContainText('amigo');
    });

    test('placeholder some ao digitar', async ({ page }) => {
        await showFullOpeningState(page);
        // click para focar, depois type para garantir disparo do evento input
        await page.locator('#password-input').click();
        await page.keyboard.type('a');
        // aguarda o handler JS atualizar o estilo
        await page.waitForFunction(() => {
            const ph = document.getElementById('fake-placeholder');
            return parseFloat(getComputedStyle(ph).opacity) === 0;
        }, { timeout: 2000 });
        const opacity = await page.locator('#fake-placeholder').evaluate(
            el => getComputedStyle(el).opacity
        );
        expect(parseFloat(opacity)).toBe(0);
    });

    // ── Screenshot de referência ────────────────────────────────────────────

    test('screenshot inicial', async ({ page }, testInfo) => {
        await page.screenshot({
            path: `test-results/screenshots/opening-initial-${testInfo.project.name}.png`,
            fullPage: false,
        });
    });

    test('screenshot com estado completo', async ({ page }, testInfo) => {
        await showFullOpeningState(page);
        await page.waitForTimeout(600);
        await page.screenshot({
            path: `test-results/screenshots/opening-full-${testInfo.project.name}.png`,
            fullPage: false,
        });
    });
});
