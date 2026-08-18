import { expect, test } from '@playwright/test';

test('loads on the Tutorial page by default', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/RegExp/i);
  await expect(
    page.getByRole('heading', { name: /Guided tour/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Tutorial', exact: true }),
  ).toHaveClass(/nav-link--active/);
});

test('header shows Feedback, Spec and GitHub links', async ({ page }) => {
  await page.goto('/');

  const feedback = page.getByRole('link', { name: /Feedback/i });
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveAttribute('href', /forms\.gle\//);
  await expect(feedback).toHaveAttribute('target', '_blank');

  // The link reads "Spec"; ECMA-262 is what its tooltip names.
  const spec = page.getByRole('link', { name: 'Spec', exact: true });
  await expect(spec).toHaveAttribute('href', /tc39\.es\/ecma262/);
  await expect(spec).toHaveAttribute('title', /ECMA-262/);

  const github = page.getByRole('link', { name: /Source on GitHub/i });
  await expect(github).toHaveAttribute(
    'href',
    /github\.com\/cheminfo\/regexp\.cheminfo\.org/,
  );
});

test('all six tabs render their main heading without errors', async ({
  page,
}) => {
  await page.goto('/');

  // Listen for console errors that would indicate a runtime crash.
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const tabs: Array<{ name: string; heading: RegExp }> = [
    { name: 'Tutorial', heading: /Guided tour/i },
    { name: 'Playground', heading: /Your regular expression/i },
    { name: 'Exercises', heading: /Progress/i },
    { name: 'Cheatsheet', heading: /Cheatsheet|Basics/i },
    { name: 'Glossary', heading: /Glossary|Look-?around|Quantifier/i },
    { name: 'About', heading: /About this site/i },
  ];

  for (const tab of tabs) {
    await page.getByRole('link', { name: tab.name, exact: true }).click();
    await expect(
      page.getByRole('heading', { name: tab.heading }).first(),
    ).toBeVisible();
  }

  expect(
    consoleErrors.filter(
      // Vite's HMR / React 18 dev-time noise is not a real failure.
      (m) => !/HMR|React DevTools|404/.test(m),
    ),
  ).toEqual([]);
});

test('deep-link to Playground works on reload', async ({ page }) => {
  await page.goto('/playground');

  await expect(
    page.getByRole('link', { name: 'Playground', exact: true }),
  ).toHaveClass(/nav-link--active/);
  await expect(
    page.getByRole('heading', { name: /Your regular expression/i }),
  ).toBeVisible();
});

test('About page shows EPFL credit and grep / sed / Python snippets', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(
    page.getByText(/This website is provided by Luc Patiny from/),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'EPFL', exact: true }),
  ).toBeVisible();

  await expect(page.getByText(/grep -rnE/)).toBeVisible();
  await expect(page.getByText(/sed -E -i/)).toBeVisible();
  await expect(page.getByText(/re\.findall/)).toBeVisible();
});
