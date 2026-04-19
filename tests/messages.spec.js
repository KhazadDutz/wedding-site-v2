import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8181/routes/mensagens/';
const MENU = 'http://localhost:8181/routes/menu/';

// Intercepta chamadas ao Apps Script para não gerar tráfego externo
test.beforeEach(async ({ page }) => {
    await page.route('**/script.google.com/**', route =>
        route.fulfill({ status: 200, body: '{"status":"ok"}', contentType: 'application/json' })
    );
    await page.goto(BASE);
});

// ── Imagem ──────────────────────────────────────────────────────────────────

test('imagem está visível', async ({ page }) => {
    const img = page.locator('#messages-image');
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(box.width).toBeGreaterThan(50);
    expect(box.height).toBeGreaterThan(50);
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

// ── Formulário ───────────────────────────────────────────────────────────────

test('título do formulário está visível', async ({ page }) => {
    await expect(page.locator('#form-title')).toBeVisible();
});

test('textarea de mensagem está visível', async ({ page }) => {
    await expect(page.locator('#message-input')).toBeVisible();
});

test('campo de nome está visível', async ({ page }) => {
    await expect(page.locator('#name-input')).toBeVisible();
});

test('botão "Enviar mensagem" está visível', async ({ page }) => {
    await expect(page.locator('#send-btn')).toBeVisible();
});

test('botão enviar tem altura mínima de 44px', async ({ page }) => {
    const box = await page.locator('#send-btn').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
});

// ── Validação ────────────────────────────────────────────────────────────────

test('enviar sem mensagem não redireciona', async ({ page }) => {
    await page.locator('#send-btn').click();
    await expect(page).toHaveURL(BASE);
    await expect(page.locator('#send-btn')).toBeEnabled();
});

test('enviar sem nome não redireciona', async ({ page }) => {
    await page.locator('#message-input').fill('Parabéns!');
    await page.locator('#send-btn').click();
    await expect(page).toHaveURL(BASE);
    await expect(page.locator('#send-btn')).toBeEnabled();
});

// ── Fluxo de envio ───────────────────────────────────────────────────────────

test('preencher mensagem e nome exibe confirmação antes de redirecionar', async ({ page }) => {
    await page.locator('#message-input').fill('Felicidades aos noivos!');
    await page.locator('#name-input').fill('Bilbo Bolseiro');
    await page.locator('#send-btn').click();
    await expect(page.locator('#success-msg')).toBeVisible();
    await expect(page.locator('#success-msg')).toContainText('enviada');
});

test('redireciona ao menu após confirmação (~2s)', async ({ page }) => {
    await page.clock.install();
    await page.route('**/script.google.com/**', route =>
        route.fulfill({ status: 200, body: '{"status":"ok"}' })
    );
    await page.goto(BASE);

    await page.locator('#message-input').fill('Felicidades!');
    await page.locator('#name-input').fill('Frodo');
    await page.locator('#send-btn').click();

    await expect(page.locator('#success-msg')).toBeVisible();

    await page.clock.fastForward(2100);

    await expect(page).toHaveURL(MENU);
});

test('Enter no campo nome dispara envio e exibe confirmação', async ({ page }) => {
    await page.locator('#message-input').fill('Viva os noivos!');
    await page.locator('#name-input').fill('Aragorn');
    await page.locator('#name-input').press('Enter');
    await expect(page.locator('#success-msg')).toBeVisible();
});

// ── Screenshots ──────────────────────────────────────────────────────────────

test('screenshot — página inicial', async ({ page }, testInfo) => {
    await page.screenshot({
        path: `test-results/messages-${testInfo.project.name}.png`,
        fullPage: false,
    });
});
