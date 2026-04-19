import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8181/routes/presentes/';

test.beforeEach(async ({ page }) => {
    await page.route('**/tenor.com/**', route =>
        route.fulfill({ status: 200, body: '', contentType: 'text/html' })
    );
    await page.goto(BASE);
});

// ── Estrutura ────────────────────────────────────────────────────────────────

test('título "Lista de Presentes" está visível', async ({ page }) => {
    await expect(page.locator('#gifts-title')).toBeVisible();
});

test('grid de presentes existe na página', async ({ page }) => {
    await expect(page.locator('#gifts-grid')).toBeVisible();
});

test('ao menos um card é renderizado', async ({ page }) => {
    await expect(page.locator('.gift-card').first()).toBeVisible();
});

test('cada card tem título visível', async ({ page }) => {
    await expect(page.locator('.gift-card .gift-title').first()).toBeVisible();
});

test('cada card é um botão', async ({ page }) => {
    const tag = await page.locator('.gift-card').first().evaluate(el => el.tagName.toLowerCase());
    expect(tag).toBe('button');
});

// ── Modal Pix ────────────────────────────────────────────────────────────────

test('modal Pix oculto ao carregar', async ({ page }) => {
    await expect(page.locator('#pix-overlay')).toBeHidden();
});

test('clicar em um card abre o modal Pix', async ({ page }) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-overlay')).toBeVisible();
});

test('modal exibe o QR Code', async ({ page }) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-qrcode')).toBeVisible();
});

test('modal exibe o código Pix', async ({ page }) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-code')).toBeVisible();
    const text = await page.locator('#pix-code').textContent();
    expect(text).toContain('laurasilveirareyes@gmail.com');
});

test('modal exibe mensagem de confirmação com nome da Laura', async ({ page }) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-info')).toContainText('Laura Silveira Reyes');
});

test('botão Fechar fecha o modal', async ({ page }) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-overlay')).toBeVisible();
    await page.locator('#pix-close-btn').click();
    await expect(page.locator('#pix-overlay')).toBeHidden();
});

test('clicar no backdrop fecha o modal', async ({ page }) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-overlay')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.locator('#pix-overlay')).toBeHidden();
});

// ── Botão Voltar ─────────────────────────────────────────────────────────────

test('botão "Voltar ao menu" está visível', async ({ page }) => {
    await expect(page.locator('#back-btn')).toBeVisible();
});

test('botão "Voltar ao menu" aponta para /menu', async ({ page }) => {
    const href = await page.locator('#back-btn').getAttribute('href');
    expect(href).toContain('menu');
});

test('botão "Voltar ao menu" tem altura mínima de 44px', async ({ page }) => {
    const box = await page.locator('#back-btn').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
});

// ── Grid responsivo ──────────────────────────────────────────────────────────

test('grid tem 4 colunas no desktop', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop') return;
    const cards = page.locator('.gift-card');
    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    expect(Math.abs(box0.y - box1.y)).toBeLessThan(5);
});

test('grid tem 2 colunas no mobile portrait', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile-portrait') return;
    const cards = page.locator('.gift-card');
    const box0 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(2).boundingBox();
    expect(box2.y).toBeGreaterThan(box0.y + box0.height / 2);
});

// ── Lazy loading ─────────────────────────────────────────────────────────────

test('gif do primeiro card visível carrega iframe', async ({ page }) => {
    await expect(page.locator('.gift-gif iframe').first()).toBeVisible({ timeout: 5000 });
});

// ── Screenshots ──────────────────────────────────────────────────────────────

test('screenshot — página de presentes', async ({ page }, testInfo) => {
    await page.screenshot({
        path: `test-results/gifts-${testInfo.project.name}.png`,
        fullPage: false,
    });
});

test('screenshot — modal Pix aberto', async ({ page }, testInfo) => {
    await page.locator('.gift-card').first().click();
    await expect(page.locator('#pix-overlay')).toBeVisible();
    await page.screenshot({
        path: `test-results/gifts-pix-${testInfo.project.name}.png`,
        fullPage: false,
    });
});
