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
  const before = '## Um dia comum\n\nUm **instante** antes da foto.';
  const after =
    '\n\nDepois da foto, a história continua com *calma*.\n\n- Uma lembrança\n- Outra ideia';
  const field = page.getByLabel('Seu texto', { exact: false });
  await field.fill(before + after);
  await field.evaluate((element, position) => {
    const textarea = element as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(position, position);
    textarea.dispatchEvent(new Event('select'));
  }, before.length);
  await page.getByLabel('Fotos', { exact: false }).setInputFiles({
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.getByRole('img', { name: 'Foto selecionada para a postagem' })).toBeVisible();
  await expect(field).toHaveValue(/!\[foto\]\(\/api\/images\//);
  await page.getByRole('button', { name: 'Prévia', exact: true }).click();
  const preview = page.getByLabel('Prévia da postagem');
  await expect(preview.getByRole('heading', { name: 'Um dia comum' })).toBeVisible();
  await expect(preview.locator('strong')).toHaveText('instante');
  await expect(preview.getByRole('img', { name: 'foto', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Publicar texto' }).click();
  await expect(page.getByRole('heading', { name: 'Uma pausa no caminho' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Seu texto foi publicado');
  const url = page.url();
  const context = await browser.newContext();
  const visitor = await context.newPage();
  await visitor.goto(url);
  await expect(visitor.getByRole('heading', { name: 'Uma pausa no caminho' })).toBeVisible();
  await expect(visitor.getByRole('button', { name: 'Excluir postagem' })).toHaveCount(0);
  await expect(visitor.getByRole('img', { name: 'foto', exact: true })).toBeVisible();
  const reading = visitor.locator('.reading .markdown-body');
  await expect(reading.locator('strong')).toHaveText('instante');
  await expect(reading.locator('em')).toHaveText('calma');
  await expect(reading.locator('li')).toHaveCount(2);
  expect(await reading.locator(':scope > p').allTextContents()).toEqual([
    'Um instante antes da foto.',
    '',
    'Depois da foto, a história continua com calma.',
  ]);
  await visitor.goto('/');
  await expect(visitor.getByRole('heading', { name: 'Postagens', exact: true })).toBeVisible();
  await expect(visitor.getByRole('heading', { name: 'Uma pausa no caminho' })).toBeVisible();
  await expect(visitor.getByRole('button', { name: 'Escrever', exact: true })).toHaveCount(0);
  await context.close();
  await page.getByRole('button', { name: 'Editar postagem', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Editar postagem' })).toBeVisible();
  await page
    .getByLabel('Seu texto', { exact: false })
    .fill((await field.inputValue()) + '\n\n## Atualização\n\nUma nova nota.');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('heading', { name: 'Atualização', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Postagem atualizada');
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

test('tema respeita o sistema, permite alternar e mantém a escolha ao recarregar', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Ativar modo claro' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const darkBackground = await page
    .locator('html')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Ativar modo escuro' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  const lightBackground = await page
    .locator('html')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(lightBackground).not.toBe(darkBackground);
  expect(lightBackground).toBe('rgb(255, 253, 250)');
  expect(darkBackground).toBe('rgb(30, 28, 33)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Área do autor' })).toHaveCount(0);
  await page.screenshot({ path: '/tmp/blog-dark-mobile.png', fullPage: true });
  await page.goto('/?autor=1');
  await expect(page.getByRole('heading', { name: 'Área do autor' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Markdown remove scripts, eventos e links executáveis', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__markdownXss = 0;
  });
  await page.route('**/api/posts', (route) =>
    route.fulfill({
      json: [
        {
          id: 99,
          title: 'Conteúdo seguro',
          createdAt: '2026-10-24T12:00:00Z',
          images: [],
          content:
            '## Um título\n\n**Negrito** e *itálico*.\n\n<script>window.__markdownXss=1</script>\n\n<img src="x" onerror="window.__markdownXss=1">\n\n[Link perigoso](javascript:window.__markdownXss=1)\n\n```js\nconst valor = 1;\n```',
        },
      ],
    }),
  );
  await page.goto('/?post=99');
  const body = page.locator('.markdown-body');
  await expect(body.getByRole('heading', { name: 'Um título' })).toBeVisible();
  await expect(body.locator('strong')).toHaveText('Negrito');
  await expect(body.locator('pre code')).toContainText('const valor = 1;');
  await expect(body.locator('script,iframe,[onerror],a[href^="javascript:"]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__markdownXss)).toBe(0);
});

test('fotos Markdown com legenda não duplicam e fotos antigas continuam visíveis', async ({
  page,
}) => {
  await page.route('**/api/posts', (route) =>
    route.fulfill({
      json: [
        {
          id: 100,
          title: 'Fotos no texto',
          createdAt: '2026-10-24T12:00:00Z',
          images: ['/api/images/inline.png', '/api/images/legacy.png'],
          content:
            'Antes da foto.\n\n![Uma foto](/api/images/inline.png "Legenda")\n\nDepois da foto.\n\n```md\n![Exemplo de código](/api/images/legacy.png)\n```',
        },
      ],
    }),
  );
  await page.goto('/?post=100');
  await expect(page.locator('.markdown-body img')).toHaveCount(1);
  await expect(page.locator('.markdown-body img')).toHaveAttribute('title', 'Legenda');
  await expect(page.locator('.article-images img')).toHaveCount(1);
  await expect(page.locator('.article-images img')).toHaveAttribute(
    'src',
    '/api/images/legacy.png',
  );
});

test('menu flutuante contém só postagens e sobre, navega e responde ao teclado', async ({
  page,
}) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir menu', exact: true });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('navigation', { name: 'Principal' })).toHaveCount(0);
  await toggle.click();
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav.getByRole('link')).toHaveCount(2);
  await expect(nav.getByRole('link', { name: 'Postagens', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'Sobre o autor', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Sobre o autor', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/pagina=sobre/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sobre o autor', exact: true })).toBeVisible();
  await toggle.click();
  await expect(nav.getByRole('link', { name: 'Sobre o autor', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await nav.getByRole('link', { name: 'Postagens', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Postagens', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Sobre o autor', exact: true })).toBeVisible();
  await toggle.click();
  await page.getByRole('heading', { name: 'Sobre o autor', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('menu móvel permanece acessível nos dois temas e respeita movimento reduzido', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link')).toHaveCount(
    2,
  );
  expect(
    await page.locator('.menu-panel').evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const buttonBounds = await page
    .getByRole('button', { name: 'Fechar menu', exact: true })
    .boundingBox();
  const panelBounds = await page.locator('.menu-panel').boundingBox();
  expect(buttonBounds!.y).toBeLessThan(64);
  expect(buttonBounds!.x).toBeLessThan(64);
  expect(panelBounds!.y).toBeGreaterThanOrEqual(buttonBounds!.y + buttonBounds!.height);
  await page.screenshot({ path: '/tmp/blog-floating-menu-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click();
  await expect(page.getByRole('button', { name: 'Abrir menu', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await page.screenshot({ path: '/tmp/blog-floating-menu-dark.png', fullPage: true });
  await page.getByRole('link', { name: 'Sobre o autor', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sobre o autor', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Área do autor', exact: true })).toHaveCount(0);
});
