import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ABOUT } from '../src/about.ts';
import { PAGE_ROUTES } from '../src/state/routes.ts';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function expectToolMatches(page: Page) {
  await page.getByPlaceholder('Type your regular expression…').fill('[cs]at');
  await page.locator('textarea.test-text').fill('bat cat hat sat');

  await expect(page.getByText('2 matches', { exact: true })).toBeVisible();
  await expect(page.locator('.highlight-output mark')).toHaveText([
    'cat',
    'sat',
  ]);
  expect(
    await page.locator('.highlight-output mark').allTextContents(),
  ).toStrictEqual(['cat', 'sat']);
}

test('the tool at / highlights exactly the matches of a typed pattern', async ({
  page,
}) => {
  await page.goto('/');
  await expectToolMatches(page);
});

test('/about renders the About page with its heading and the footer', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'regexp.cheminfo',
  );
  await expect(
    page.getByRole('heading', { name: 'What you can do here', exact: true }),
  ).toBeVisible();
  expect(await page.locator('.about-can li').allTextContents()).toStrictEqual(
    ABOUT.can,
  );
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

for (const query of ['?embed', '?embed=1']) {
  test(`${query} drops the header and the footer and keeps the tool`, async ({
    page,
  }) => {
    await page.goto(`/${query}`);

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
    await expectToolMatches(page);
  });
}

for (const route of PAGE_ROUTES) {
  test(`${route.path} loads without a page error or console error`, async ({
    page,
  }) => {
    const errors = collectErrors(page);

    await page.goto(route.path);
    await expect(page.getByRole('main')).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(errors).toStrictEqual([]);
  });
}
