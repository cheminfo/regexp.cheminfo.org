import { expect, test } from '@playwright/test';

// Reset localStorage before every test so we always start from a clean slate.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.removeItem('regexp-cheminfo:exercise-state:v1');
    window.localStorage.removeItem('regexp-cheminfo:active-exercise:v1');
  });
  await page.goto('/#/exercises');
});

test('solving the first exercise marks it as done and persists in localStorage', async ({
  page,
}) => {
  // The first exercise is "Match the word 'hello'" — solution: hello.
  await expect(
    page.getByRole('heading', { name: /Match the word "hello"$/ }),
  ).toBeVisible();

  // Progress starts at 0 / N solved.
  await expect(page.getByText(/0 \/ \d+ exercises solved/)).toBeVisible();

  // Type the solution.
  await page.getByLabel('Regular expression pattern').fill('hello');

  // Auto-solve via the effect kicks in as soon as validation passes — the
  // success Callout appears without the user clicking "Check".
  await expect(
    page.getByText(/Brilliant! Exercise solved\./),
  ).toBeVisible();

  // Progress is incremented to 1 / N.
  await expect(page.getByText(/1 \/ \d+ exercises solved/)).toBeVisible();

  // localStorage now records the solved state.
  const stored = await page.evaluate(() =>
    window.localStorage.getItem('regexp-cheminfo:exercise-state:v1'),
  );
  expect(stored).toBeTruthy();
  const parsed = JSON.parse(stored ?? '{}') as Record<
    string,
    { status: string; pattern: string }
  >;
  const entry = parsed['literal-hello'];
  expect(entry?.status).toBe('solved');
  expect(entry?.pattern).toBe('hello');
});

test('progress persists across a full page reload', async ({ page }) => {
  await page.getByLabel('Regular expression pattern').fill('hello');
  await expect(
    page.getByText(/Brilliant! Exercise solved\./),
  ).toBeVisible();

  // Hard reload — the persisted state should still mark exercise 1 as solved.
  await page.reload();
  await expect(page.getByText(/1 \/ \d+ exercises solved/)).toBeVisible();
});

test('an invalid attempt is reported and not stored as solved', async ({
  page,
}) => {
  await page.getByLabel('Regular expression pattern').fill('goodbye');

  // Trigger the explicit check (auto-solve only fires when validation passes).
  await page.getByRole('button', { name: /Check my regex/i }).click();

  await expect(page.getByText(/Not quite yet/i)).toBeVisible();

  // Progress is still at zero, no stored state for that exercise.
  await expect(page.getByText(/0 \/ \d+ exercises solved/)).toBeVisible();
});

test('the hint button reveals hints one at a time', async ({ page }) => {
  // Hints are revealed by clicking the button; counter is part of the label.
  await expect(
    page.getByRole('button', { name: /Reveal hint \(0\/2\)/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: /Reveal hint/ }).click();

  await expect(
    page.getByRole('button', { name: /Reveal hint \(1\/2\)/ }),
  ).toBeVisible();
  await expect(page.locator('text=Hints').first()).toBeVisible();
});

test('"Clear all answers" wipes localStorage after confirmation', async ({
  page,
}) => {
  await page.getByLabel('Regular expression pattern').fill('hello');
  await expect(
    page.getByText(/Brilliant! Exercise solved\./),
  ).toBeVisible();

  await page.getByRole('button', { name: /Clear all answers/i }).click();

  // The confirmation Alert opens; confirm it.
  await page
    .locator('.bp6-alert')
    .getByRole('button', { name: 'Clear all answers' })
    .click();

  await expect(page.getByText(/0 \/ \d+ exercises solved/)).toBeVisible();
  const stored = await page.evaluate(() =>
    window.localStorage.getItem('regexp-cheminfo:exercise-state:v1'),
  );
  expect(stored).toBe('{}');
});
