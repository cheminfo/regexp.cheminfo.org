import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test('clicking each tab updates the URL hash and the selected tab', async ({
  page,
}) => {
  await page.goto('/');

  const tabs: Array<{ name: string; hash: RegExp }> = [
    { name: 'Playground', hash: /#\/playground$/ },
    { name: 'Exercises', hash: /#\/exercises(\/|$)/ },
    { name: 'Cheatsheet', hash: /#\/cheatsheet$/ },
    { name: 'Glossary', hash: /#\/glossary$/ },
    { name: 'About', hash: /#\/about$/ },
    { name: 'Tutorial', hash: /#\/tutorial$/ },
  ];

  for (const tab of tabs) {
    const trigger = page.getByRole('tab', { name: tab.name });

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(tab.hash);
  }
});

test('browser back/forward navigates between tabs via hashchange', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Playground' }).click();
  await page.getByRole('tab', { name: 'Glossary' }).click();

  await expect(page).toHaveURL(/#\/glossary$/);

  await page.goBack();
  await expect(page).toHaveURL(/#\/playground$/);
  await expect(
    page.getByRole('tab', { name: 'Playground' }),
  ).toHaveAttribute('aria-selected', 'true');

  await page.goForward();
  await expect(page).toHaveURL(/#\/glossary$/);
  await expect(
    page.getByRole('tab', { name: 'Glossary' }),
  ).toHaveAttribute('aria-selected', 'true');
});

test('opening Exercises restores the last active exercise from localStorage', async ({
  page,
}) => {
  // Pick exercise #3 ("digit") and verify it persists across a navigation
  // away + back. The in-page "select another exercise" buttons do NOT push
  // a new hash (only switching the top-level Tab does), but the active id
  // is written to localStorage immediately.
  await page.goto('/#/exercises');
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
  await page.getByRole('tab', { name: 'Tutorial' }).click();
  await page.getByRole('tab', { name: 'Exercises' }).click();

  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#\/exercises\/digit$/);
});

test('hovering a flag toggle button reveals its BlueprintJS tooltip', async ({
  page,
}) => {
  await page.goto('/#/playground');

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
  await page.goto('/#/exercises');
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

  // Reload directly on /#/exercises (no exercise id in the hash) — the page
  // must restore "digit" from localStorage rather than defaulting to the
  // first exercise.
  await page.goto('/#/exercises');
  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();
});

test('an unknown hash falls back to the Tutorial tab', async ({ page }) => {
  await page.goto('/#/this-route-does-not-exist');

  await expect(
    page.getByRole('tab', { name: 'Tutorial' }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('heading', { name: /Guided tour/i }),
  ).toBeVisible();
});
