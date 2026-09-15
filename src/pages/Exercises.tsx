import {
  Button,
  Callout,
  Card,
  Code,
  FormGroup,
  H4,
  H5,
  Icon,
  InputGroup,
  Tag,
} from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProgressRecords } from 'react-cheminfo/core';
import {
  failedValidation,
  localStorageProgressStore,
  pluralize,
  progressSummary,
} from 'react-cheminfo/core';
import {
  ExerciseActions,
  ExerciseProgressHeader,
  ExerciseStatusIcon,
  HintLadder,
  LEVEL_INTENT,
} from 'react-cheminfo/ui';

import { RegexDiagram } from '../components/RegexDiagram.tsx';
import { RegexInput } from '../components/RegexInput.tsx';
import { EXERCISES } from '../data/exercises.ts';
import { compileRegex } from '../regex/compile.ts';
import type { ExerciseCaseResult } from '../regex/validate.ts';
import { validateExercise } from '../regex/validate.ts';
import { lastExercise } from '../state/lastExercise.ts';
import { parsePath, routePath } from '../state/router.ts';
import { pathWithoutBase, withBase } from '../state/site.ts';
import type { Exercise, ExerciseState } from '../types.ts';

type StateMap = ProgressRecords<ExerciseState>;

function defaultState(): ExerciseState {
  return {
    pattern: '',
    flags: '',
    replacement: '',
    status: 'idle',
    hintsRevealed: 0,
    showSolution: false,
    showDiagram: false,
  };
}

const PROGRESS = localStorageProgressStore<ExerciseState>({
  key: 'regexp-cheminfo:exercise-state',
  version: 1,
  defaults: defaultState(),
});

const EXERCISE_IDS: readonly string[] = EXERCISES.map((ex) => ex.id);

function readExerciseIdFromAddress(): string | null {
  const { exerciseId } = parsePath(
    pathWithoutBase(globalThis.location.pathname),
  );
  if (!exerciseId) return null;
  return EXERCISES.some((ex) => ex.id === exerciseId) ? exerciseId : null;
}

function readLastExerciseId(): string | null {
  const { id } = lastExercise.read().value;
  return EXERCISES.some((ex) => ex.id === id) ? id : null;
}

function loadState(): StateMap {
  const stored = PROGRESS.load();
  // The localStorage binding answers at once; a networked one would not.
  return stored instanceof Promise ? {} : stored;
}

const FIRST_EXERCISE: Exercise | undefined = EXERCISES[0];

/**
 * Exercises page. Renders the list of challenges on the left, the active
 * exercise on the right and persists progress in `localStorage`. Supports both
 * `match` exercises (write a regex that matches/doesn't match) and `replace`
 * exercises (write a regex + replacement string that transforms input text).
 * @returns The exercises page component.
 */
export function Exercises() {
  const [activeId, setActiveIdState] = useState<string>(() => {
    const id =
      readExerciseIdFromAddress() ??
      readLastExerciseId() ??
      FIRST_EXERCISE?.id ??
      '';
    if (id) lastExercise.write({ id });
    return id;
  });
  const [statesByExercise, setStatesByExercise] = useState<StateMap>(loadState);

  useEffect(() => {
    void PROGRESS.save(statesByExercise);
  }, [statesByExercise]);

  const exercise = EXERCISES.find((ex) => ex.id === activeId) ?? FIRST_EXERCISE;
  const exerciseId = exercise?.id ?? '';
  const state = statesByExercise[exerciseId] ?? defaultState();

  const selectExercise = useCallback((id: string) => {
    setActiveIdState(id);
    lastExercise.write({ id });
    // Each exercise is an address of its own, so it can be handed out and
    // indexed rather than only reached by clicking down the list.
    globalThis.history.pushState(
      null,
      '',
      withBase(routePath({ page: 'exercises', exerciseId: id })),
    );
  }, []);

  const updateState = useCallback(
    (patch: Partial<ExerciseState>) => {
      if (!exercise) return;
      const { id } = exercise;
      setStatesByExercise((prev) => {
        const next = { ...(prev[id] ?? defaultState()), ...patch };
        // An answer that passes is solved as it is typed, so the menu badge
        // follows without a click on "Check".
        if (
          next.status !== 'solved' &&
          validateExercise(exercise, next.pattern, next.flags, next.replacement)
            .passed
        ) {
          next.status = 'solved';
        }
        return { ...prev, [id]: next };
      });
    },
    [exercise],
  );

  const compiled = useMemo(
    () => compileRegex(state.pattern, state.flags),
    [state.pattern, state.flags],
  );

  const validation = useMemo(() => {
    if (!exercise) {
      return failedValidation<ExerciseCaseResult>('No exercise to check.');
    }
    return validateExercise(
      exercise,
      state.pattern,
      state.flags,
      state.replacement,
    );
  }, [exercise, state.pattern, state.flags, state.replacement]);

  const summary = progressSummary(statesByExercise, EXERCISE_IDS);

  if (!exercise) {
    return <Card>No exercises available.</Card>;
  }

  function check() {
    if (validation.passed) {
      updateState({ status: 'solved' });
    } else {
      updateState({ status: 'attempted' });
    }
  }

  function revealHint() {
    if (!exercise) return;
    if (state.hintsRevealed < exercise.hints.length) {
      updateState({ hintsRevealed: state.hintsRevealed + 1 });
    }
  }

  function resetExercise() {
    updateState({
      pattern: '',
      flags: '',
      replacement: '',
      status: 'idle',
      hintsRevealed: 0,
      showSolution: false,
    });
  }

  function clearAllAnswers() {
    setStatesByExercise({});
  }

  const isReplace = exercise.kind === 'replace';

  return (
    <div className="section-stack">
      <Card elevation={1}>
        <H4 style={{ marginTop: 0 }}>Progress</H4>
        <ExerciseProgressHeader
          summary={summary}
          onClearAll={clearAllAnswers}
          clearDisabled={Object.keys(statesByExercise).length === 0}
        />
      </Card>

      <div className="exercise-list">
        <nav className="exercise-menu" aria-label="Exercises">
          {EXERCISES.map((ex) => {
            const exStored = statesByExercise[ex.id];
            const exState = exStored?.status ?? 'idle';
            const exHints = exStored?.hintsRevealed ?? 0;
            const isActive = ex.id === exercise.id;
            const isSolved = exState === 'solved';
            const isAttempted = exState === 'attempted';
            const statusClass = isSolved
              ? 'is-solved'
              : isAttempted
                ? 'is-attempted'
                : '';
            return (
              <Button
                key={ex.id}
                active={isActive}
                variant={isActive ? 'solid' : 'outlined'}
                onClick={() => {
                  selectExercise(ex.id);
                }}
                alignText="left"
                className={statusClass}
              >
                <div className="ex-meta">
                  <ExerciseStatusIcon status={exState} />
                  <div className="ex-body">
                    <span className="ex-title">{ex.title}</span>
                    <div className="ex-tags">
                      <Tag minimal intent={LEVEL_INTENT[ex.level]}>
                        {ex.level}
                      </Tag>
                      {ex.kind === 'replace' && (
                        <Tag minimal intent="primary">
                          replace
                        </Tag>
                      )}
                      {isSolved && (
                        <Tag minimal intent="success" icon="tick">
                          solved
                        </Tag>
                      )}
                      {exHints > 0 && (
                        <Tag
                          minimal
                          intent="warning"
                          icon="lightbulb"
                          title={
                            isSolved
                              ? `Solved with ${exHints} ${pluralize(exHints, 'hint')}`
                              : `${exHints} ${pluralize(exHints, 'hint')} revealed`
                          }
                        >
                          {exHints} {pluralize(exHints, 'hint')}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        <div className="section-stack">
          <Card elevation={1}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag minimal intent={LEVEL_INTENT[exercise.level]}>
                {exercise.level}
              </Tag>
              <Tag minimal intent={isReplace ? 'primary' : 'none'}>
                {exercise.kind}
              </Tag>
            </div>
            <H4 style={{ marginTop: 8 }}>{exercise.title}</H4>
            <p style={{ color: '#5c7080', marginTop: 0 }}>
              {exercise.description}
            </p>

            <RegexInput
              pattern={state.pattern}
              flags={state.flags}
              error={compiled.error}
              onPatternChange={(value) => {
                updateState({ pattern: value });
              }}
              onFlagsChange={(value) => {
                updateState({ flags: value });
              }}
            />

            {isReplace && (
              <FormGroup
                label="Replacement string"
                helperText="Use $& for the whole match, $1 / $2 / … for capturing groups, $<name> for named groups."
                style={{ marginTop: 12 }}
              >
                <InputGroup
                  value={state.replacement}
                  onChange={(event) => {
                    updateState({ replacement: event.target.value });
                  }}
                  placeholder="$1, $&, …"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  aria-label="Replacement string"
                  fill
                />
              </FormGroup>
            )}

            <div style={{ marginTop: 12 }}>
              <ExerciseActions
                onCheck={check}
                checkLabel="Check my regex"
                onRevealHint={revealHint}
                hintsRevealed={state.hintsRevealed}
                hintCount={exercise.hints.length}
                onToggleSolution={() => {
                  updateState({ showSolution: !state.showSolution });
                }}
                showSolution={state.showSolution}
                onReset={resetExercise}
              >
                <Button
                  icon="diagram-tree"
                  onClick={() => {
                    updateState({ showDiagram: !state.showDiagram });
                  }}
                  text={state.showDiagram ? 'Hide diagram' : 'Show diagram'}
                />
              </ExerciseActions>
            </div>

            {state.status === 'solved' && validation.passed && (
              <Callout
                intent="success"
                icon="confirm"
                title="Brilliant! Exercise solved."
                style={{ marginTop: 12 }}
              >
                All test cases pass. Move on to the next exercise.
                {state.hintsRevealed > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <Tag minimal intent="warning" icon="lightbulb">
                      Solved with {state.hintsRevealed}{' '}
                      {pluralize(state.hintsRevealed, 'hint')}
                    </Tag>
                  </div>
                )}
              </Callout>
            )}
            {state.status === 'attempted' && !validation.passed && (
              <Callout
                intent="danger"
                icon="cross"
                title="Not quite yet"
                style={{ marginTop: 12 }}
              >
                Look at the test cases below to see what fails.
              </Callout>
            )}

            {state.hintsRevealed > 0 && (
              <div style={{ marginTop: 12 }}>
                <HintLadder
                  hints={exercise.hints}
                  revealed={state.hintsRevealed}
                />
              </div>
            )}

            {state.showSolution && (
              <Callout
                intent="warning"
                icon="key"
                title="Sample solution"
                style={{ marginTop: 12 }}
              >
                <Code>
                  /{exercise.solution}/{(exercise.solutionFlags ?? []).join('')}
                </Code>
                {isReplace && (
                  <div style={{ marginTop: 6 }}>
                    Replacement:{' '}
                    <Code>
                      {displayReplacement(exercise.solutionReplacement)}
                    </Code>
                  </div>
                )}
              </Callout>
            )}
          </Card>

          {state.showDiagram && (
            <Card elevation={1}>
              <H4>Diagram of your regex</H4>
              <RegexDiagram
                pattern={state.pattern}
                flags={state.flags}
                error={compiled.error}
              />
            </Card>
          )}

          <Card elevation={1}>
            <H4>Test cases</H4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {validation.cases.map((result) => (
                <TestCaseRow
                  key={testCaseKey(result)}
                  result={result}
                  hasCompileError={Boolean(compiled.error)}
                />
              ))}
            </div>
            {validation.cases.some((c) => !c.passed) && !compiled.error && (
              <div style={{ marginTop: 10 }}>
                <H5>Failures detail</H5>
                <div className="failure-list">
                  {validation.cases
                    .filter((c) => !c.passed)
                    .map((failure) => (
                      <FailureDetail
                        key={testCaseKey(failure)}
                        result={failure}
                      />
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

interface TestCaseRowProps {
  result: ExerciseCaseResult;
  hasCompileError: boolean;
}

function TestCaseRow({ result, hasCompileError }: TestCaseRowProps) {
  const intent: 'success' | 'danger' | 'none' = result.passed
    ? 'success'
    : hasCompileError
      ? 'none'
      : 'danger';
  const icon = result.passed
    ? 'tick-circle'
    : hasCompileError
      ? 'circle'
      : 'cross-circle';

  if (result.kind === 'replace') {
    return (
      <div className="test-case">
        <Icon icon={icon} intent={intent} />
        <div className="tc-grid">
          <span className="tc-label">Input</span>
          <VisibleText text={result.testCase.text} />
          <span className="tc-label">Expected</span>
          <VisibleText text={result.testCase.expected} />
        </div>
        <Tag minimal intent={intent}>
          replace
        </Tag>
      </div>
    );
  }

  return (
    <div className="test-case">
      <Icon icon={icon} intent={intent} />
      <div className="tc-grid tc-grid-single">
        <span className="tc-label">Input</span>
        <VisibleText text={result.testCase.text} />
      </div>
      <Tag minimal intent={intent}>
        {result.testCase.shouldMatch
          ? result.testCase.expected
            ? `match: ${result.testCase.expected}`
            : 'must match'
          : 'must not match'}
      </Tag>
    </div>
  );
}

function FailureDetail({ result }: { result: ExerciseCaseResult }) {
  if (result.kind === 'replace') {
    return (
      <div className="failure-detail">
        <span className="fd-label">Input</span>
        <span className="fd-full">
          <VisibleText text={result.testCase.text} />
        </span>
        <span className="fd-label">Expected</span>
        <VisibleText text={result.testCase.expected} />
        <span className="fd-label">Got</span>
        {result.actual === null ? (
          <span className="fd-error">{result.reason}</span>
        ) : (
          <VisibleText text={result.actual} />
        )}
      </div>
    );
  }

  const { testCase, actual, reason } = result;

  if (testCase.shouldMatch) {
    if (actual === null) {
      return (
        <div className="failure-detail">
          <span className="fd-label">Input</span>
          <span className="fd-full">
            <VisibleText text={testCase.text} />
          </span>
          <span className="fd-label">Expected</span>
          <span className="fd-error fd-full">
            a match
            {testCase.expected ? (
              <>
                {' '}
                of `<code>{testCase.expected}</code>`
              </>
            ) : null}{' '}
            — found none
          </span>
        </div>
      );
    }
    if (testCase.expected !== undefined && actual !== testCase.expected) {
      return (
        <div className="failure-detail">
          <span className="fd-label">Input</span>
          <span className="fd-full">
            <VisibleText text={testCase.text} />
          </span>
          <span className="fd-label">Expected match</span>
          <VisibleText text={testCase.expected} />
          <span className="fd-label">Got match</span>
          <VisibleText text={actual} />
        </div>
      );
    }
    // Capture-group mismatch or other reason — fall back to reason text.
    return (
      <div className="failure-detail">
        <span className="fd-label">Input</span>
        <span className="fd-full">
          <VisibleText text={testCase.text} />
        </span>
        <span className="fd-label">Problem</span>
        <span className="fd-error fd-full">{reason}</span>
      </div>
    );
  }

  // shouldMatch: false but a match was found
  return (
    <div className="failure-detail">
      <span className="fd-label">Input</span>
      <span className="fd-full">
        <VisibleText text={testCase.text} />
      </span>
      <span className="fd-label">Problem</span>
      <span className="fd-error fd-full">
        should not match, but matched <VisibleText text={actual ?? ''} inline />
      </span>
    </div>
  );
}

interface VisibleTextProps {
  text: string;
  inline?: boolean;
}

function VisibleText({ text, inline = false }: VisibleTextProps) {
  if (text === '') {
    return <span className="visible-text empty-string">(empty string)</span>;
  }
  return (
    <span className={`visible-text${inline ? ' is-inline' : ''}`}>
      {renderVisibleParts(text)}
    </span>
  );
}

function renderVisibleParts(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let buffer = '';
  let key = 0;
  const flush = () => {
    if (buffer) {
      parts.push(<span key={`t${key++}`}>{buffer}</span>);
      buffer = '';
    }
  };
  for (const ch of text) {
    if (ch === ' ') {
      flush();
      parts.push(
        <span key={`s${key++}`} className="ws ws-space">
          ·
        </span>,
      );
    } else if (ch === '\t') {
      flush();
      parts.push(
        <span key={`t${key++}`} className="ws ws-tab">
          →
        </span>,
      );
    } else if (ch === '\n') {
      flush();
      parts.push(
        <span key={`n${key++}`} className="ws ws-nl">
          ↵
        </span>,
        '\n',
      );
    } else {
      buffer += ch;
    }
  }
  flush();
  return parts;
}

function testCaseKey(result: ExerciseCaseResult): string {
  if (result.kind === 'replace') {
    return `replace::${result.testCase.text}::${result.testCase.expected}`;
  }
  return `match::${result.testCase.text}::${String(result.testCase.shouldMatch)}`;
}

function displayReplacement(replacement: string): string {
  if (replacement === '') return '(empty string)';
  return replacement;
}
