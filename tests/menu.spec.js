// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Menu Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/routes/menu/');
    });

    // ── Layout ──────────────────────────────────────────────────────────────

    test('imagem de fundo visível', async ({ page }) => {
        const img = page.locator('#menu-image');
        await expect(img).toBeVisible();
    });

    test('três botões de navegação visíveis após animação', async ({ page }) => {
        // Botões aparecem com 1s de delay — fast-forward
        await page.evaluate(() => {
            document.getElementById('behind-door').classList.add('menu-visible');
        });
        await page.waitForTimeout(200);

        const buttons = page.locator('.menu-btn');
        await expect(buttons).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(buttons.nth(i)).toBeVisible();
        }
    });

    test('botões têm os textos corretos', async ({ page }) => {
        await page.evaluate(() => {
            document.getElementById('behind-door').classList.add('menu-visible');
        });
        await page.waitForTimeout(200);

        await expect(page.locator('.menu-btn').nth(0)).toHaveText('Convite');
        await expect(page.locator('.menu-btn').nth(1)).toHaveText('Deixe sua Mensagem');
        await expect(page.locator('.menu-btn').nth(2)).toHaveText('Lista de Presentes');
    });

    test('botões com links corretos', async ({ page }) => {
        const btn0 = page.locator('.menu-btn').nth(0);
        const btn1 = page.locator('.menu-btn').nth(1);
        const btn2 = page.locator('.menu-btn').nth(2);

        await expect(btn0).toHaveAttribute('href', '../convite');
        await expect(btn1).toHaveAttribute('href', '../mensagens');
        await expect(btn2).toHaveAttribute('href', '../presentes');
    });

    test('sem overflow horizontal', async ({ page }) => {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    // ── Imagem responsiva: mobile portrait usa menu_mobile.png ──────────────

    test('imagem carregada com src não vazio', async ({ page }) => {
        const img = page.locator('#menu-image');
        const src = await img.evaluate(el => el.currentSrc || el.src);
        expect(src).toBeTruthy();
        expect(src.length).toBeGreaterThan(10);
    });

    // ── Easter Egg ──────────────────────────────────────────────────────────

    test('fool overlay começa oculto', async ({ page }) => {
        const overlay = page.locator('#fool-overlay');
        await expect(overlay).toHaveClass(/hidden/);
    });

    test('clicar no easter egg exibe o fool overlay', async ({ page }) => {
        await page.locator('#easter-egg-btn').click();
        const overlay = page.locator('#fool-overlay');
        await expect(overlay).not.toHaveClass(/hidden/);
    });

    test('fool overlay contém texto "FOOL OF A TOOK"', async ({ page }) => {
        await page.locator('#easter-egg-btn').click();
        await page.waitForTimeout(3000); // aguarda GIF → texto
        await expect(page.locator('.fool-line-1')).toContainText('FOOL OF A TOOK');
    });

    test('fool overlay desaparece automaticamente', async ({ page }) => {
        await page.locator('#easter-egg-btn').click();
        // Total: GIF 2500ms + fade 400ms + texto 4000ms + fade-out 600ms = 7500ms
        await page.waitForTimeout(8000);
        await expect(page.locator('#fool-overlay')).toHaveClass(/hidden/);
    });

    // ── Touch targets (tamanho mínimo para toque) ────────────────────────────

    test('botões têm altura mínima de 44px (Apple HIG)', async ({ page }) => {
        await page.evaluate(() => {
            document.getElementById('behind-door').classList.add('menu-visible');
        });
        await page.waitForTimeout(200);

        const buttons = page.locator('.menu-btn');
        const count = await buttons.count();
        for (let i = 0; i < count; i++) {
            const box = await buttons.nth(i).boundingBox();
            expect(box).not.toBeNull();
            expect(box.height).toBeGreaterThanOrEqual(44);
        }
    });

    // ── Screenshot de referência ────────────────────────────────────────────

    test('screenshot inicial', async ({ page }, testInfo) => {
        await page.screenshot({
            path: `test-results/screenshots/menu-initial-${testInfo.project.name}.png`,
            fullPage: false,
        });
    });

    test('screenshot com menu visível', async ({ page }, testInfo) => {
        await page.evaluate(() => {
            document.getElementById('behind-door').classList.add('menu-visible');
        });
        await page.waitForTimeout(1200); // aguarda transição
        await page.screenshot({
            path: `test-results/screenshots/menu-visible-${testInfo.project.name}.png`,
            fullPage: false,
        });
    });
});
