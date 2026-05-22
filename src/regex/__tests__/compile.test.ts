import { expect, test } from 'vitest';

import { applyReplace, compileRegex, findMatches } from '../compile.ts';

test('compileRegex returns null on empty pattern', () => {
  const result = compileRegex('', '');

  expect(result.regex).toBeNull();
  expect(result.error).toBeNull();
});

test('compileRegex reports invalid pattern', () => {
  const result = compileRegex('(', '');

  expect(result.regex).toBeNull();
  expect(typeof result.error).toBe('string');
});

test('findMatches highlights matches', () => {
  const { regex } = compileRegex(String.raw`\d+`, 'g');
  const result = findMatches(regex, 'a1bb22ccc333');

  expect(result.count).toBe(3);
  expect(result.matches.map((m) => m.value)).toStrictEqual(['1', '22', '333']);
  expect(result.segments.map((s) => s.text).join('')).toBe('a1bb22ccc333');
});

test('findMatches handles non-global pattern', () => {
  const { regex } = compileRegex(String.raw`\d+`, '');
  const result = findMatches(regex, 'a1bb22ccc333');

  expect(result.count).toBe(1);
  expect(result.matches[0]?.value).toBe('1');
});

test('findMatches survives zero-width matches', () => {
  const { regex } = compileRegex('a*', 'g');
  const result = findMatches(regex, 'baab');

  expect(result.count).toBeGreaterThan(0);
});

test('findMatches captures prefix, suffix and numbered groups', () => {
  const { regex } = compileRegex(String.raw`(hello) (world)`, '');
  const result = findMatches(regex, 'before hello world after');

  expect(result.matches).toHaveLength(1);

  const match = result.matches[0];

  expect(match?.value).toBe('hello world');
  expect(match?.index).toBe(7);
  expect(match?.prefix).toBe('before ');
  expect(match?.suffix).toBe(' after');
  expect(match?.groups).toStrictEqual(['hello', 'world']);
  expect(match?.namedGroups).toBeNull();
});

test('findMatches captures named groups', () => {
  const { regex } = compileRegex(
    String.raw`(?<year>\d{4})-(?<month>\d{2})`,
    '',
  );
  const result = findMatches(regex, '2026-05');

  expect(result.matches[0]?.namedGroups).toStrictEqual({
    year: '2026',
    month: '05',
  });
});

test('findMatches preserves undefined for non-participating groups', () => {
  const { regex } = compileRegex(String.raw`(a)|(b)`, '');
  const result = findMatches(regex, 'a');

  expect(result.matches[0]?.groups).toStrictEqual(['a', undefined]);
});

test('applyReplace substitutes captured groups', () => {
  const { regex } = compileRegex(String.raw`(\w+) (\w+)`, 'g');

  expect(applyReplace(regex, 'hello world', '$2 $1')).toBe('world hello');
});

test('applyReplace returns original text on null regex', () => {
  expect(applyReplace(null, 'hello', 'x')).toBe('hello');
});
