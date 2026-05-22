import type {
  Exercise,
  MatchExercise,
  MatchTestCase,
  ReplaceExercise,
  ReplaceTestCase,
} from '../types.ts';

import { compileRegex } from './compile.ts';

export interface MatchTestCaseResult {
  kind: 'match';
  testCase: MatchTestCase;
  passed: boolean;
  reason: string;
  actual: string | null;
}

export interface ReplaceTestCaseResult {
  kind: 'replace';
  testCase: ReplaceTestCase;
  passed: boolean;
  reason: string;
  actual: string | null;
}

export type TestCaseResult = MatchTestCaseResult | ReplaceTestCaseResult;

export interface ValidationResult {
  passed: boolean;
  error: string | null;
  cases: TestCaseResult[];
}

/**
 * Run a student-provided regex (and optional replacement) against an exercise
 * and return per-test-case results plus an overall pass/fail.
 * @param exercise - The exercise to validate against.
 * @param pattern - The student's regex pattern.
 * @param flags - The student's flags string.
 * @param replacement - The student's replacement string. Ignored for `match`
 *   exercises; required for `replace` exercises.
 * @returns The validation result with per-case detail.
 */
export function validateExercise(
  exercise: Exercise,
  pattern: string,
  flags: string,
  replacement = '',
): ValidationResult {
  if (pattern === '') {
    return {
      passed: false,
      error: 'The regex is empty — write something before validating.',
      cases: emptyCases(exercise),
    };
  }

  const compiled = compileRegex(pattern, flags);
  if (compiled.error || !compiled.regex) {
    return {
      passed: false,
      error: compiled.error ?? 'Invalid regex',
      cases: emptyCases(exercise),
    };
  }

  const cases =
    exercise.kind === 'replace'
      ? validateReplaceCases(exercise, compiled.regex, replacement)
      : validateMatchCases(exercise, compiled.regex);

  return {
    passed: cases.every((c) => c.passed),
    error: null,
    cases,
  };
}

function emptyCases(exercise: Exercise): TestCaseResult[] {
  if (exercise.kind === 'replace') {
    return exercise.testCases.map(
      (testCase): ReplaceTestCaseResult => ({
        kind: 'replace',
        testCase,
        passed: false,
        reason: 'not evaluated',
        actual: null,
      }),
    );
  }
  return exercise.testCases.map(
    (testCase): MatchTestCaseResult => ({
      kind: 'match',
      testCase,
      passed: false,
      reason: 'not evaluated',
      actual: null,
    }),
  );
}

function validateMatchCases(
  exercise: MatchExercise,
  sourceRegex: RegExp,
): MatchTestCaseResult[] {
  return exercise.testCases.map((testCase): MatchTestCaseResult => {
    const runRegex = cloneRegex(sourceRegex);
    if (!runRegex) {
      return {
        kind: 'match',
        testCase,
        passed: false,
        reason: 'regex error',
        actual: null,
      };
    }

    runRegex.lastIndex = 0;
    const match = runRegex.exec(testCase.text);

    if (testCase.shouldMatch) {
      if (!match) {
        return {
          kind: 'match',
          testCase,
          passed: false,
          reason: 'expected a match, found none',
          actual: null,
        };
      }
      if (testCase.expected !== undefined && match[0] !== testCase.expected) {
        return {
          kind: 'match',
          testCase,
          passed: false,
          reason: `match was "${match[0]}", expected "${testCase.expected}"`,
          actual: match[0],
        };
      }
      if (testCase.expectedGroups !== undefined) {
        for (let i = 0; i < testCase.expectedGroups.length; i++) {
          const expected = testCase.expectedGroups[i];
          const actual = match[i + 1];
          if (actual !== expected) {
            return {
              kind: 'match',
              testCase,
              passed: false,
              reason: `capture group ${i + 1} was ${formatGroup(actual)}, expected ${formatGroup(expected)}`,
              actual: match[0],
            };
          }
        }
      }
      return {
        kind: 'match',
        testCase,
        passed: true,
        reason: 'ok',
        actual: match[0],
      };
    }
    if (match) {
      return {
        kind: 'match',
        testCase,
        passed: false,
        reason: `should not match, but found "${match[0]}"`,
        actual: match[0],
      };
    }
    return {
      kind: 'match',
      testCase,
      passed: true,
      reason: 'ok',
      actual: null,
    };
  });
}

function validateReplaceCases(
  exercise: ReplaceExercise,
  sourceRegex: RegExp,
  replacement: string,
): ReplaceTestCaseResult[] {
  return exercise.testCases.map((testCase): ReplaceTestCaseResult => {
    const runRegex = cloneRegex(sourceRegex);
    if (!runRegex) {
      return {
        kind: 'replace',
        testCase,
        passed: false,
        reason: 'regex error',
        actual: null,
      };
    }

    let actual: string;
    try {
      actual = testCase.text.replace(runRegex, replacement);
    } catch (error) {
      return {
        kind: 'replace',
        testCase,
        passed: false,
        reason: error instanceof Error ? error.message : 'replacement failed',
        actual: null,
      };
    }

    if (actual === testCase.expected) {
      return {
        kind: 'replace',
        testCase,
        passed: true,
        reason: 'ok',
        actual,
      };
    }
    return {
      kind: 'replace',
      testCase,
      passed: false,
      reason: `result was "${actual}", expected "${testCase.expected}"`,
      actual,
    };
  });
}

function cloneRegex(source: RegExp): RegExp | null {
  try {
    return new RegExp(source.source, source.flags);
  } catch {
    return null;
  }
}

function formatGroup(value: string | undefined): string {
  return value === undefined ? '(not captured)' : `"${value}"`;
}
