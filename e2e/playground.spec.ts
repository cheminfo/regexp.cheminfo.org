import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
});

test('default regex highlights words of 4+ chars in the sample text', async ({
  page,
}) => {
  // The default state ships with /\b\w{4,}\b/gi and a Lorem-ipsum sample.
  const pattern = page.getByLabel('Regular expression pattern');
  await expect(pattern).toHaveValue(String.raw`\b\w{4,}\b`);

  // At least one match must be highlighted in the live output.
  const marks = page.locator('.highlight-output mark');
  await expect(marks.first()).toBeVisible();
  expect(await marks.count()).toBeGreaterThan(5);
});

test('changing the pattern updates the live match count', async ({ page }) => {
  const pattern = page.getByLabel('Regular expression pattern');

  await pattern.fill(String.raw`\d+`);

  // The Lorem-ipsum default text has no digits → 0 matches.
  await expect(page.getByText(/0 matches/i)).toBeVisible();

  await pattern.fill(String.raw`[aeiou]`);

  // Lots of vowels → many matches; the summary tag flips to success/n matches.
  await expect(page.locator('.highlight-output mark').first()).toBeVisible();
  await expect(page.getByText(/\d+ matches/)).toBeVisible();
});

test('invalid regex shows a parse error and clears the diagram', async ({
  page,
}) => {
  const pattern = page.getByLabel('Regular expression pattern');

  await pattern.fill('(');

  await expect(page.locator('.regex-error')).toBeVisible();
  await expect(page.locator('.regex-error')).toContainText(
    /Invalid|Unterminated/,
  );
  await expect(page.getByText(/The regex is not valid yet/)).toBeVisible();
});

test('flag toggles update the pattern flags string', async ({ page }) => {
  const flags = page.getByLabel('Regular expression flags');

  // The default flags string is "gi". Toggle the i flag off via the button.
  const iButton = page.getByRole('button', { name: /^i · ignoreCase$/i });
  await iButton.click();
  await expect(flags).not.toHaveValue(/i/);

  // Toggling the m flag adds it.
  const mButton = page.getByRole('button', { name: /^m · multiline$/i });
  await mButton.click();
  await expect(flags).toHaveValue(/m/);
});

test('replace preview shows the substituted output', async ({ page }) => {
  await page.getByRole('button', { name: /Show replace/i }).click();

  const pattern = page.getByLabel('Regular expression pattern');
  await pattern.fill('ipsum');

  const replace = page.getByPlaceholder('$1, $&, …');
  await replace.fill('IPSUM');

  // The "After replacement" preview must contain the substituted token.
  const preview = page.locator('pre').last();
  await expect(preview).toContainText('IPSUM');
});
