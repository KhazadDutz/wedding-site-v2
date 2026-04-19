import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8181/routes/convite/';

// Intercepta chamadas ao Apps Script para não gerar tráfego externo
test.beforeEach(async ({ page }) => {
    await page.route('**/script.google.com/**', route =>
        route.fulfill({ status: 200, body: '{"status":"ok"}', contentType: 'application/json' })
    );
    await page.goto(BASE);
});

// ── Imagem ──────────────────────────────────────────────────────────────────

test('imagem do convite está visível', async ({ page }) => {
    const img = page.locator('#convite-image');
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(box.width).toBeGreaterThan(50);
    expect(box.height).toBeGreaterThan(50);
});

test('imagem ocupa área significativa da tela', async ({ page }) => {
    const img = page.locator('#convite-image');
    const box = await img.boundingBox();
    const vw  = await page.evaluate(() => window.innerWidth);
    const vh  = await page.evaluate(() => window.innerHeight);
    // A imagem deve cobrir ao menos 50% da dimensão menor da viewport
    const minDim = Math.min(vw, vh);
    expect(Math.max(box.width, box.height)).toBeGreaterThan(minDim * 0.5);
});

test('sem overflow / scrollbars', async ({ page }) => {
    const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth ||
        document.documentElement.scrollHeight > window.innerHeight
    );
    expect(overflow).toBe(false);
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

// ── Google Maps ──────────────────────────────────────────────────────────────

test('link do Google Maps está visível', async ({ page }) => {
    await expect(page.locator('#maps-btn')).toBeVisible();
});

test('link do Google Maps aponta para a URL correta', async ({ page }) => {
    const href = await page.locator('#maps-btn').getAttribute('href');
    expect(href).toBe('https://maps.app.goo.gl/z4pKFp5R53TYJ8YB8');
});

test('link do Google Maps tem altura mínima de 28px', async ({ page }) => {
    // maps-btn é overlay sobre a imagem — espaço limitado, não usa min-height 44px
    const box = await page.locator('#maps-btn').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(28);
});

// ── Botão RSVP ───────────────────────────────────────────────────────────────

test('botão "Confirme aqui sua presença" está visível', async ({ page }) => {
    await expect(page.locator('#rsvp-btn')).toBeVisible();
});

test('botão RSVP tem altura mínima de 44px (ou 36px em landscape)', async ({ page }, testInfo) => {
    const box = await page.locator('#rsvp-btn').boundingBox();
    const minH = testInfo.project.name === 'mobile-landscape' ? 36 : 44;
    expect(box.height).toBeGreaterThanOrEqual(minH);
});

test('botão RSVP está abaixo do botão Voltar', async ({ page }) => {
    const backBox = await page.locator('#back-btn').boundingBox();
    const rsvpBox = await page.locator('#rsvp-btn').boundingBox();
    expect(rsvpBox.y).toBeGreaterThan(backBox.y);
});

// ── Modal (fluxo RSVP) ───────────────────────────────────────────────────────

test('modal oculto ao carregar a página', async ({ page }) => {
    await expect(page.locator('#rsvp-overlay')).toBeHidden();
});

test('clicar em RSVP abre o modal', async ({ page }) => {
    await page.locator('#rsvp-btn').click();
    await expect(page.locator('#rsvp-overlay')).toBeVisible();
    await expect(page.locator('#modal-title')).toContainText('nome completo');
    await expect(page.locator('#name-input')).toBeVisible();
    await expect(page.locator('#confirm-btn')).toBeVisible();
});

test('"Presença confirmada" oculta ao abrir modal', async ({ page }) => {
    await page.locator('#rsvp-btn').click();
    await expect(page.locator('#confirmed-msg')).toBeHidden();
});

test('clicar fora do modal (backdrop) fecha o modal', async ({ page }) => {
    await page.locator('#rsvp-btn').click();
    await expect(page.locator('#rsvp-overlay')).toBeVisible();
    // Clica no canto superior esquerdo (fora do modal centralizado)
    await page.mouse.click(5, 5);
    await expect(page.locator('#rsvp-overlay')).toBeHidden();
});

test('confirmar com campo vazio não envia nem fecha o modal', async ({ page }) => {
    await page.locator('#rsvp-btn').click();
    await page.locator('#confirm-btn').click();
    await expect(page.locator('#rsvp-overlay')).toBeVisible();
    await expect(page.locator('#confirmed-msg')).toBeHidden();
});

test('digitar nome e confirmar exibe "Presença confirmada"', async ({ page }) => {
    await page.locator('#rsvp-btn').click();
    await page.locator('#name-input').fill('Bilbo Bolseiro');
    await page.locator('#confirm-btn').click();
    await expect(page.locator('#confirmed-msg')).toBeVisible();
    await expect(page.locator('#confirmed-msg')).toContainText('confirmada');
});

test('modal fecha automaticamente após confirmação (~2.5s)', async ({ page }) => {
    // Instala fake clock antes de navegar para controlar setTimeout
    await page.clock.install();
    await page.route('**/script.google.com/**', route =>
        route.fulfill({ status: 200, body: '{"status":"ok"}' })
    );
    await page.goto(BASE);

    await page.locator('#rsvp-btn').click();
    await page.locator('#name-input').fill('Frodo Bolseiro');
    await page.locator('#confirm-btn').click();

    await expect(page.locator('#confirmed-msg')).toBeVisible();

    // Avança o relógio 2.6s para disparar o setTimeout(closeModal, 2500)
    await page.clock.fastForward(2600);

    await expect(page.locator('#rsvp-overlay')).toBeHidden();
});

test('modal reseta após fechar e pode ser reaberto', async ({ page }) => {
    // Primeiro fluxo: abre → cancela via backdrop
    await page.locator('#rsvp-btn').click();
    await page.locator('#name-input').fill('teste');
    await page.mouse.click(5, 5);
    await expect(page.locator('#rsvp-overlay')).toBeHidden();

    // Segundo fluxo: reabre → input deve estar limpo
    await page.locator('#rsvp-btn').click();
    await expect(page.locator('#name-input')).toHaveValue('');
    await expect(page.locator('#confirmed-msg')).toBeHidden();
    await expect(page.locator('#confirm-btn')).toBeVisible();
});

// ── Screenshots ──────────────────────────────────────────────────────────────

test('screenshot — página inicial', async ({ page }, testInfo) => {
    await page.screenshot({
        path: `test-results/convite-${testInfo.project.name}.png`,
        fullPage: false,
    });
});

test('screenshot — modal aberto', async ({ page }, testInfo) => {
    await page.locator('#rsvp-btn').click();
    await expect(page.locator('#rsvp-overlay')).toBeVisible();
    await page.screenshot({
        path: `test-results/convite-modal-${testInfo.project.name}.png`,
        fullPage: false,
    });
});
