import { expect, test } from 'vitest';

import { EXERCISES } from '../../data/exercises.ts';
import { validateExercise } from '../validate.ts';

const [FIRST_EXERCISE] = EXERCISES;
if (!FIRST_EXERCISE) {
  throw new Error(
    'At least one exercise must be defined in src/data/exercises.ts',
  );
}

const BOUNDARY_EXERCISE = EXERCISES.find((ex) => ex.id === 'word-boundary-cat');
if (!BOUNDARY_EXERCISE) {
  throw new Error('Expected "word-boundary-cat" exercise to be defined');
}

const SWAP_NAMES_EXERCISE = EXERCISES.find(
  (ex) => ex.id === 'replace-swap-names',
);
if (SWAP_NAMES_EXERCISE?.kind !== 'replace') {
  throw new Error(
    'Expected "replace-swap-names" replace exercise to be defined',
  );
}

const REDACT_DIGITS_EXERCISE = EXERCISES.find(
  (ex) => ex.id === 'replace-redact-digits',
);
if (REDACT_DIGITS_EXERCISE?.kind !== 'replace') {
  throw new Error(
    'Expected "replace-redact-digits" replace exercise to be defined',
  );
}

const CAPTURE_NAME_EXERCISE = EXERCISES.find(
  (ex) => ex.id === 'capture-group-name',
);
if (CAPTURE_NAME_EXERCISE?.kind !== 'match') {
  throw new Error('Expected "capture-group-name" match exercise to be defined');
}

test('every exercise is solvable by its own sample solution', () => {
  for (const exercise of EXERCISES) {
    const flags = (exercise.requiredFlags ?? []).join('');
    const replacement =
      exercise.kind === 'replace' ? exercise.solutionReplacement : '';
    const result = validateExercise(
      exercise,
      exercise.solution,
      flags,
      replacement,
    );
    const failingCase = result.cases.find((c) => !c.passed);
    const reason = failingCase?.reason ?? 'flags missing';

    expect(
      result.passed,
      `Exercise "${exercise.id}" sample solution should pass — reason: ${reason}`,
    ).toBe(true);
  }
});

test('empty pattern returns an error', () => {
  const result = validateExercise(FIRST_EXERCISE, '', '');

  expect(result.passed).toBe(false);
  expect(typeof result.error).toBe('string');
});

test('invalid regex returns an error', () => {
  const result = validateExercise(FIRST_EXERCISE, '(', '');

  expect(result.passed).toBe(false);
  expect(typeof result.error).toBe('string');
});

test('a regex that matches too much fails the negative test cases', () => {
  const result = validateExercise(BOUNDARY_EXERCISE, 'cat', '');

  expect(result.passed).toBe(false);
  expect(result.cases.some((c) => !c.passed)).toBe(true);
});

test('replace exercise: wrong replacement string fails', () => {
  const result = validateExercise(
    SWAP_NAMES_EXERCISE,
    SWAP_NAMES_EXERCISE.solution,
    '',
    '$1 $2',
  );

  expect(result.passed).toBe(false);
  expect(result.cases.every((c) => c.kind === 'replace')).toBe(true);
  expect(result.cases.some((c) => !c.passed)).toBe(true);
});

test('expectedGroups: matching the right substring but wrong group fails', () => {
  // `Hello, \w+(!)` makes the full match equal to "Hello, Alice!" but
  // captures "!" in group 1 instead of the name. Without `expectedGroups`
  // this would pass; with it, the test must fail with a group-mismatch
  // reason.
  const result = validateExercise(
    CAPTURE_NAME_EXERCISE,
    String.raw`Hello, \w+(!)`,
    '',
  );

  expect(result.passed).toBe(false);

  const failing = result.cases.find((c) => !c.passed);

  expect(failing?.reason).toContain('capture group 1');
});

test('replace exercise: missing required flag g is reported', () => {
  const result = validateExercise(
    REDACT_DIGITS_EXERCISE,
    REDACT_DIGITS_EXERCISE.solution,
    '',
    REDACT_DIGITS_EXERCISE.solutionReplacement,
  );

  expect(result.passed).toBe(false);
  expect(result.missingFlags).toStrictEqual(['g']);
});
