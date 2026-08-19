import { aboutProblems, resolveAbout } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { ABOUT } from '../about.ts';

test('the About record is within the length the family reads', () => {
  expect(aboutProblems(ABOUT)).toStrictEqual([]);
});

test('the About says what the tool is, in five lines', () => {
  expect(ABOUT.siteId).toBe('regexp');
  expect(ABOUT.can).toHaveLength(5);
  expect(ABOUT.paragraphs).toHaveLength(2);
  expect(ABOUT.can[0]).toBe(
    'Follow 13 tutorial steps, from a literal match to lookahead and named groups.',
  );
});

test('every borrowed work the site runs on is named, and resolves', () => {
  expect(ABOUT.credits).toStrictEqual([
    'blueprint',
    'react-cheminfo',
    'react',
    'vite',
  ]);

  const about = resolveAbout(ABOUT);

  expect(about.credits.map((credit) => credit.name)).toStrictEqual([
    'Blueprint',
    'react-cheminfo',
    'React',
    'Vite',
  ]);
  expect(about.repository).toBe(
    'https://github.com/cheminfo/regexp.cheminfo.org',
  );
  expect(about.issues).toBe(
    'https://github.com/cheminfo/regexp.cheminfo.org/issues',
  );
  expect(about.license).toBe('MIT');
  expect(about.cite).toStrictEqual([]);
});
