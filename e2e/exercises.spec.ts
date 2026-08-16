import { expect, test } from '@playwright/test';

// Reset localStorage before every test so we always start from a clean slate.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.removeItem('regexp-cheminfo:exercise-state:v1');
    window.localStorage.removeItem('regexp-cheminfo:active-exercise:v1');
  });
  await page.goto('/exercises');
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
  await expect(page.getByText(/Brilliant! Exercise solved\./)).toBeVisible();

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
  await expect(page.getByText(/Brilliant! Exercise solved\./)).toBeVisible();

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

test('revealed hints show the actual hint text, one click at a time', async ({
  page,
}) => {
  // Exercise 1 ("literal-hello") has two hints in src/data/exercises.ts:
  //   1. "A regex made of plain letters matches those exact letters."
  //   2. "The regex /hello/ matches the substring \"hello\"."
  const reveal = page.getByRole('button', { name: /Reveal hint/ });

  // No hint visible yet.
  await expect(page.getByText(/plain letters/i)).toHaveCount(0);

  await reveal.click();
  await expect(
    page.getByText(
      'A regex made of plain letters matches those exact letters.',
    ),
  ).toBeVisible();
  // Second hint is NOT yet visible.
  await expect(page.getByText(/matches the substring/i)).toHaveCount(0);

  await reveal.click();
  await expect(
    page.getByText(/The regex .*hello.* matches the substring/i),
  ).toBeVisible();

  // Both hints are revealed → the button is disabled at 2/2.
  await expect(
    page.getByRole('button', { name: /Reveal hint \(2\/2\)/ }),
  ).toBeDisabled();
});

test('the test-case list updates live as the student types', async ({
  page,
}) => {
  const pattern = page.getByLabel('Regular expression pattern');

  // Type a partial answer. "hel" matches "hello world" but returns "hel"
  // (not the expected "hello"), so the Failures-detail block renders.
  await pattern.fill('hel');

  const failures = page.locator('.failure-list');
  await expect(failures).toBeVisible();
  await expect(failures.getByText('Expected match').first()).toBeVisible();
  await expect(failures.getByText('Got match').first()).toBeVisible();

  // Completing the regex flips the exercise to solved and clears the
  // failure list.
  await pattern.fill('hello');
  await expect(page.getByText(/Brilliant! Exercise solved\./)).toBeVisible();
  await expect(page.locator('.failure-list')).toHaveCount(0);
});

test('navigating to a different exercise loads its own persisted state', async ({
  page,
}) => {
  // Solve exercise 1 ("literal-hello") with pattern "hello".
  await page.getByLabel('Regular expression pattern').fill('hello');
  await expect(page.getByText(/Brilliant! Exercise solved\./)).toBeVisible();

  // Jump to exercise 3 ("digit") — its input must be empty (fresh state).
  await page.getByRole('button', { name: /^Find any digit/i }).click();
  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();
  await expect(page.getByLabel('Regular expression pattern')).toHaveValue('');

  // Type a partial answer and reload — pattern should come back from
  // localStorage as "\d" for "digit", not "hello" from the other exercise.
  await page.getByLabel('Regular expression pattern').fill('\\d');
  await expect(page.getByText(/Brilliant! Exercise solved\./)).toBeVisible();

  await page.reload();

  // After reload we must land back on "digit" with "\d" pre-filled.
  await expect(
    page.getByRole('heading', { name: /^Find any digit$/i }),
  ).toBeVisible();
  await expect(page.getByLabel('Regular expression pattern')).toHaveValue(
    '\\d',
  );
  await expect(page.getByText(/2 \/ \d+ exercises solved/)).toBeVisible();

  // And the menu badge for both exercises must show the solved tick icon.
  const stored = await page.evaluate(() =>
    JSON.parse(
      window.localStorage.getItem('regexp-cheminfo:exercise-state:v1') ?? '{}',
    ),
  );
  expect(stored['literal-hello']?.status).toBe('solved');
  expect(stored.digit?.status).toBe('solved');
});

test('"Clear all answers" wipes localStorage after confirmation', async ({
  page,
}) => {
  await page.getByLabel('Regular expression pattern').fill('hello');
  await expect(page.getByText(/Brilliant! Exercise solved\./)).toBeVisible();

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
