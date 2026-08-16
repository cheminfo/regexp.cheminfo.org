import { expect, test } from 'vitest';

import { EXERCISES } from '../../data/exercises.ts';
import { everyPage, pageMetaFor } from '../pageMeta.ts';
import { PAGES, parsePath, pathFromLegacyHash, routePath } from '../router.ts';

test('every page of the header is an address of its own', () => {
  const paths = PAGES.map((page) => routePath({ page: page.id }));

  expect(paths).toStrictEqual([
    '/',
    '/playground',
    '/exercises',
    '/cheatsheet',
    '/glossary',
    '/about',
  ]);
});

test('an address opens the page it names', () => {
  expect(parsePath('/')).toStrictEqual({ page: 'tutorial' });
  expect(parsePath('/playground')).toStrictEqual({ page: 'playground' });
  expect(parsePath('/exercises')).toStrictEqual({ page: 'exercises' });
  expect(parsePath('/exercises/word-boundary-cat')).toStrictEqual({
    page: 'exercises',
    exerciseId: 'word-boundary-cat',
  });
});

test('an address the site does not know opens the tutorial', () => {
  expect(parsePath('/this-route-does-not-exist')).toStrictEqual({
    page: 'tutorial',
  });
  expect(parsePath('')).toStrictEqual({ page: 'tutorial' });
});

test('an address survives being written and read back', () => {
  for (const page of PAGES) {
    expect(parsePath(routePath({ page: page.id })).page).toBe(page.id);
  }

  const route = { page: 'exercises' as const, exerciseId: 'iso-date' };

  expect(parsePath(routePath(route))).toStrictEqual(route);
});

test('a link written when the site routed by the hash still opens', () => {
  expect(pathFromLegacyHash('#/playground')).toBe('/playground');
  expect(pathFromLegacyHash('#/exercises/digit')).toBe('/exercises/digit');
  expect(pathFromLegacyHash('#/tutorial')).toBe('/');
  expect(pathFromLegacyHash('#/nothing-of-ours')).toBeNull();
  expect(pathFromLegacyHash('')).toBeNull();
});

test('a malformed escape in a link does not throw the page away', () => {
  expect(parsePath('/exercises/%E0%A4%A').exerciseId).toBe('%E0%A4%A');
});

test('every page is titled and described on its own', () => {
  const pages = everyPage();

  expect(pages).toHaveLength(PAGES.length + EXERCISES.length);
  expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
  expect(new Set(pages.map((page) => page.canonicalPath)).size).toBe(
    pages.length,
  );

  for (const page of pages) {
    expect(page.description.length).toBeGreaterThan(60);
  }
});

test('an exercise is described by what it asks for, without the markers', () => {
  const meta = pageMetaFor({
    page: 'exercises',
    exerciseId: 'word-boundary-cat',
  });

  expect(meta.title).toBe(
    'Match the word "cat" but not "category" — regular expression exercise',
  );
  expect(meta.description).not.toContain('[[');
  expect(meta.canonicalPath).toBe('/exercises/word-boundary-cat');
});
