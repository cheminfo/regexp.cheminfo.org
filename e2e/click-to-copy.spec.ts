import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

async function readClipboard(page: import('@playwright/test').Page) {
  return page.evaluate(() => navigator.clipboard.readText());
}

test('the tool text is not selectable', async ({ page }) => {
  await page.goto('/playground');

  const heading = page.getByRole('heading', { name: 'Matching result' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('user-select', 'none');

  const output = page.locator('.highlight-output');
  await expect(output).toHaveCSS('user-select', 'none');

  await output.dblclick();
  const selected = await page.evaluate(
    () => globalThis.getSelection()?.toString() ?? '',
  );
  expect(selected).toBe('');
});

test('the replacement output is copied by a click', async ({ page }) => {
  await page.goto('/playground');

  await page.getByRole('button', { name: /Show replace/i }).click();
  await page.getByLabel('Regular expression pattern').fill('[cs]at');
  await page.locator('textarea.test-text').fill('bat cat hat sat');
  await page.getByPlaceholder('$1, $&, …').fill('<$&>');

  const output = page.locator('.replace-output');
  await expect(output).toHaveAttribute(
    'title',
    'Copy the replaced text (bat <cat> hat <sat>)',
  );
  await expect(output).toHaveCSS('cursor', 'copy');

  await output.click();
  await expect(output).toHaveAttribute('data-copy', 'copied');
  expect(await readClipboard(page)).toBe('bat <cat> hat <sat>');
});

test('the match count copies every match, one per line', async ({ page }) => {
  await page.goto('/playground');

  await page.getByLabel('Regular expression pattern').fill('[cs]at');
  await page.locator('textarea.test-text').fill('bat cat hat sat');

  const summary = page.locator('.match-summary .click-to-copy');
  await expect(summary).toHaveAttribute(
    'title',
    'Copy the matches, one per line',
  );
  await expect(summary).toHaveCSS('cursor', 'copy');

  await summary.click();
  await expect(summary).toHaveAttribute('data-copy', 'copied');
  expect(await readClipboard(page)).toBe('cat\nsat');
});

test('a count of zero-width matches promises no copy', async ({ page }) => {
  await page.goto('/playground');

  await page.getByLabel('Regular expression pattern').fill(String.raw`\b`);
  await page.getByLabel('Regular expression flags').fill('g');
  await page.locator('textarea.test-text').fill('cat sat');

  await expect(page.locator('.match-summary')).toHaveText('4 matches');
  await expect(page.locator('.match-summary .click-to-copy')).toHaveCount(0);
});

test('a compile error stays selectable', async ({ page }) => {
  await page.goto('/playground');

  await page.getByLabel('Regular expression pattern').fill('(');

  const error = page.locator('.regex-error');
  await expect(error).toContainText('Invalid regular expression');
  await expect(error).toHaveCSS('user-select', 'text');
});

test('a capture cell copies the value it holds', async ({ page }) => {
  await page.goto('/playground');

  await page.getByRole('button', { name: /Show replace/i }).click();
  await page.getByLabel('Regular expression pattern').fill('([cs])at');
  await page.locator('textarea.test-text').fill('bat cat hat sat');

  const firstCard = page.locator('.match-card').first();
  await expect(firstCard.locator('.match-card-title')).toHaveText('Match #1');

  const group = firstCard.locator('td.match-card-value.click-to-copy').nth(3);
  await expect(group).toHaveAttribute('title', 'Copy the value of $1 (c)');

  await group.click();
  await expect(group).toHaveAttribute('data-copy', 'copied');
  expect(await readClipboard(page)).toBe('c');
});

test('a revealed solution copies the pattern without its slashes', async ({
  page,
}) => {
  await page.goto('/exercises/case-insensitive-hello');

  await page.getByRole('button', { name: 'Reveal solution' }).click();

  const solution = page
    .locator('.bp6-callout')
    .filter({ hasText: 'Sample solution' })
    .locator('code.click-to-copy');
  await expect(solution).toHaveText('/hello/i');
  await expect(solution).toHaveAttribute('title', 'Copy the pattern (hello)');

  await solution.click();
  await expect(solution).toHaveAttribute('data-copy', 'copied');
  expect(await readClipboard(page)).toBe('hello');
});

test('the glossary stays selectable and its patterns are copied', async ({
  page,
}) => {
  await page.goto('/glossary');

  const summary = page
    .locator('.glossary-card')
    .filter({ hasText: 'Word boundary' })
    .locator('.glossary-card__summary');
  await expect(summary).toHaveCSS('user-select', 'text');

  const example = page
    .locator('code.click-to-copy')
    .filter({ hasText: String.raw`/\bcat\b/` })
    .first();
  await expect(example).toHaveAttribute(
    'title',
    String.raw`Copy the pattern (\bcat\b)`,
  );
  await expect(example).toHaveCSS('cursor', 'copy');

  await example.click();
  await expect(example).toHaveAttribute('data-copy', 'copied');
  expect(await readClipboard(page)).toBe(String.raw`\bcat\b`);
});
