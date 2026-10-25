import { test, expect } from '@playwright/test';
test('visitante lê; autor publica texto e foto; sessão encerra', async ({ page, browser }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Postagens', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nenhuma postagem ainda.' })).toBeVisible();
  await page.screenshot({ path: '/tmp/blog-desktop.png', fullPage: true });
  await expect(page.getByRole('button', { name: 'Área do autor' })).toHaveCount(0);
  await page.goto('/?autor=1');
  await page.getByLabel('Senha').fill('senha-incorreta');
  await page.getByRole('button', { name: 'Entrar na área do autor' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível entrar');
  const password = process.env['BLOG_ADMIN_PASSWORD'];
  if (!password) throw new Error('BLOG_ADMIN_PASSWORD não configurada');
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar na área do autor' }).click();
  await expect(page.getByRole('heading', { name: 'Uma nova história.' })).toBeVisible();
  await page.getByLabel('Título', { exact: true }).fill('Uma pausa no caminho');
  await page
    .getByLabel('Seu texto', { exact: true })
    .fill('Uma fotografia para lembrar do dia.\nAs pequenas coisas também merecem espaço.');
  await page.getByLabel('Fotos', { exact: false }).setInputFiles({
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.getByRole('img', { name: 'Foto selecionada para a postagem' })).toBeVisible();
  await page.getByRole('button', { name: 'Publicar texto' }).click();
  await expect(page.getByRole('heading', { name: 'Uma pausa no caminho' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Seu texto foi publicado');
  const url = page.url();
  const context = await browser.newContext();
  const visitor = await context.newPage();
  await visitor.goto(url);
  await expect(visitor.getByRole('heading', { name: 'Uma pausa no caminho' })).toBeVisible();
  await expect(visitor.getByRole('button', { name: 'Excluir postagem' })).toHaveCount(0);
  await expect(
    visitor.getByRole('img', { name: 'Foto 1 da postagem Uma pausa no caminho' }),
  ).toBeVisible();
  await visitor.goto('/');
  await expect(visitor.getByRole('heading', { name: 'Postagens', exact: true })).toBeVisible();
  await expect(visitor.getByRole('heading', { name: 'Uma pausa no caminho' })).toBeVisible();
  await expect(visitor.getByRole('button', { name: 'Escrever', exact: true })).toHaveCount(0);
  await context.close();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Excluir postagem' }).click();
  await expect(page.getByRole('heading', { name: 'Nenhuma postagem ainda.' })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Área do autor' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Postagens', exact: true })).toBeVisible();
});
test('layout móvel sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Postagens', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/blog-mobile.png', fullPage: true });
});
