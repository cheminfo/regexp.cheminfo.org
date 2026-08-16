import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test('clicking each page updates the address and the current page', async ({
  page,
}) => {
  await page.goto('/');

  const pages: Array<{ name: string; url: RegExp }> = [
    { name: 'Playground', url: /\/playground$/ },
    { name: 'Exercises', url: /\/exercises(\/|$)/ },
    { name: 'Cheatsheet', url: /\/cheatsheet$/ },
    { name: 'Glossary', url: /\/glossary$/ },
    { name: 'About', url: /\/about$/ },
    { name: 'Tutorial', url: /\/$/ },
  ];

  for (const entry of pages) {
    const trigger = page.getByRole('link', { name: entry.name, exact: true });

    await trigger.click();
    await expect(trigger).toHaveClass(/nav-link--active/);
    await expect(page).toHaveURL(entry.url);
  }
});

test('browser back/forward navigates between pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Playground', exact: true }).click();
  await page.getByRole('link', { name: 'Glossary', exact: true }).click();

  await expect(page).toHaveURL(/\/glossary$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(
    page.getByRole('link', { name: 'Playground', exact: true }),
  ).toHaveClass(/nav-link--active/);

  await page.goForward();
  await expect(page).toHaveURL(/\/glossary$/);
  await expect(
    page.getByRole('link', { name: 'Glossary', exact: true }),
  ).toHaveClass(/nav-link--active/);
});

test('opening Exercises restores the last active exercise from localStorage', async ({
  page,
}) => {
  // Pick exercise #3 ("digit") and verify it persists across a navigation
  // away + back. The in-page "select another exercise" buttons do NOT push
  // a new address entry the same way, but the active id
  // is written to localStorage immediately.
  await page.goto('/exercises');
  await page.getByRole('button', { name: /^Find any digit/i }).click();
  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();

  // localStorage now records the active exercise.
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem('regexp-cheminfo:active-exercise:v1'),
      ),
    )
    .toBe('digit');

  // Navigate away and back via the Tab component — the deep link pushed by
  // handleTabChange now includes the active exercise id.
  await page.getByRole('link', { name: 'Tutorial', exact: true }).click();
  await page.getByRole('link', { name: 'Exercises', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/exercises\/digit$/);
});

test('hovering a flag toggle button reveals its BlueprintJS tooltip', async ({
  page,
}) => {
  await page.goto('/playground');

  const ignoreCase = page.getByRole('button', { name: /^i · ignoreCase$/i });
  await ignoreCase.hover();

  // BlueprintJS Tooltip renders the popover content in a portal. The
  // tooltip text appears inside `.bp6-tooltip` (or `.bp6-popover-content`)
  // after the open delay (~100ms by default).
  await expect(
    page.locator('.bp6-tooltip').getByText(/Case-insensitive matching/i),
  ).toBeVisible();
});

test('last active exercise survives a full page reload (localStorage)', async ({
  page,
}) => {
  // Select "Find any digit" so localStorage records "digit" as active.
  await page.goto('/exercises');
  await page.getByRole('button', { name: /^Find any digit/i }).click();
  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem('regexp-cheminfo:active-exercise:v1'),
      ),
    )
    .toBe('digit');

  // Reload directly on /exercises (no exercise id in the address) — the page
  // must restore "digit" from localStorage rather than defaulting to the
  // first exercise.
  await page.goto('/exercises');
  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();
});

test('an unknown address falls back to the Tutorial page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');

  await expect(
    page.getByRole('link', { name: 'Tutorial', exact: true }),
  ).toHaveClass(/nav-link--active/);
  await expect(
    page.getByRole('heading', { name: /Guided tour/i }),
  ).toBeVisible();
});
