import {
  Alert,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Code,
  FormGroup,
  H4,
  H5,
  Icon,
  InputGroup,
  ProgressBar,
  Tag,
} from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { RegexDiagram } from '../components/RegexDiagram.tsx';
import { RegexInput } from '../components/RegexInput.tsx';
import { EXERCISES } from '../data/exercises.ts';
import { compileRegex } from '../regex/compile.ts';
import type { TestCaseResult } from '../regex/validate.ts';
import { validateExercise } from '../regex/validate.ts';
import { parsePath, routePath } from '../state/router.ts';
import { pathWithoutBase, withBase } from '../state/site.ts';
import type { Exercise, ExerciseState } from '../types.ts';

const STORAGE_KEY = 'regexp-cheminfo:exercise-state:v1';
const LAST_EXERCISE_KEY = 'regexp-cheminfo:active-exercise:v1';

function readExerciseIdFromAddress(): string | null {
  const { exerciseId } = parsePath(
    pathWithoutBase(globalThis.location.pathname),
  );
  if (!exerciseId) return null;
  return EXERCISES.some((ex) => ex.id === exerciseId) ? exerciseId : null;
}

function readLastExerciseId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(LAST_EXERCISE_KEY);
    if (!stored) return null;
    return EXERCISES.some((ex) => ex.id === stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeLastExerciseId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_EXERCISE_KEY, id);
  } catch {
    // Ignore quota errors — last-active id is best-effort.
  }
}

type StateMap = Record<string, ExerciseState>;

function loadState(): StateMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    // Migrate older entries that lack the `replacement` field.
    const map = parsed as Record<string, Partial<ExerciseState>>;
    const migrated: StateMap = {};
    for (const [id, value] of Object.entries(map)) {
      migrated[id] = { ...defaultState(), ...value };
    }
    return migrated;
  } catch {
    return {};
  }
}

function saveState(state: StateMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors — exercise state is best-effort.
  }
}

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

const LEVEL_INTENT: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

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
    if (id) writeLastExerciseId(id);
    return id;
  });
  const [statesByExercise, setStatesByExercise] = useState<StateMap>(loadState);
  const [clearAlertOpen, setClearAlertOpen] = useState(false);

  useEffect(() => {
    saveState(statesByExercise);
  }, [statesByExercise]);

  const exercise = EXERCISES.find((ex) => ex.id === activeId) ?? FIRST_EXERCISE;
  const exerciseId = exercise?.id ?? '';
  const state = statesByExercise[exerciseId] ?? defaultState();

  const selectExercise = useCallback((id: string) => {
    setActiveIdState(id);
    writeLastExerciseId(id);
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
      if (!exerciseId) return;
      setStatesByExercise((prev) => ({
        ...prev,
        [exerciseId]: {
          ...(prev[exerciseId] ?? defaultState()),
          ...patch,
        },
      }));
    },
    [exerciseId],
  );

  const compiled = useMemo(
    () => compileRegex(state.pattern, state.flags),
    [state.pattern, state.flags],
  );

  const validation = useMemo(() => {
    if (!exercise) {
      return {
        passed: false,
        error: null,
        cases: [] as TestCaseResult[],
      };
    }
    return validateExercise(
      exercise,
      state.pattern,
      state.flags,
      state.replacement,
    );
  }, [exercise, state.pattern, state.flags, state.replacement]);

  useEffect(() => {
    if (validation.passed && state.status !== 'solved') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: auto-mark as solved when the student types a valid answer, so the menu badge updates without requiring a "Check" click.
      updateState({ status: 'solved' });
    }
  }, [validation.passed, state.status, updateState]);

  const solvedCount = EXERCISES.filter(
    (ex) => statesByExercise[ex.id]?.status === 'solved',
  ).length;
  const progress = solvedCount / EXERCISES.length;

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
    setClearAlertOpen(false);
  }

  const isReplace = exercise.kind === 'replace';

  return (
    <div className="section-stack">
      <Card elevation={1}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <H4 style={{ margin: 0 }}>Progress</H4>
          <Button
            icon="trash"
            variant="minimal"
            intent="danger"
            onClick={() => {
              setClearAlertOpen(true);
            }}
            disabled={Object.keys(statesByExercise).length === 0}
            text="Clear all answers"
          />
        </div>
        <ProgressBar
          value={progress}
          intent="primary"
          animate={solvedCount < EXERCISES.length}
          stripes={false}
        />
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: '#5c7080',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {solvedCount} / {EXERCISES.length} exercises solved
          </span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </Card>

      <Alert
        isOpen={clearAlertOpen}
        intent="danger"
        icon="trash"
        confirmButtonText="Clear all answers"
        cancelButtonText="Cancel"
        onCancel={() => {
          setClearAlertOpen(false);
        }}
        onConfirm={clearAllAnswers}
      >
        <p>
          This will permanently erase your saved progress on every exercise.
          This action cannot be undone.
        </p>
      </Alert>

      <div className="exercise-list">
        <div className="exercise-menu" role="navigation" aria-label="Exercises">
          {EXERCISES.map((ex) => {
            const exStored = statesByExercise[ex.id];
            const exState = exStored?.status ?? 'idle';
            const exHints = exStored?.hintsRevealed ?? 0;
            const isActive = ex.id === exercise.id;
            const isSolved = exState === 'solved';
            const isAttempted = exState === 'attempted';
            const icon = isSolved
              ? 'tick-circle'
              : isAttempted
                ? 'warning-sign'
                : 'circle';
            const intent = isSolved
              ? 'success'
              : isAttempted
                ? 'warning'
                : 'none';
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
                  <Icon icon={icon} intent={intent} />
                  <div className="ex-body">
                    <span className="ex-title">{ex.title}</span>
                    <div className="ex-tags">
                      <Tag minimal intent={LEVEL_INTENT[ex.level] ?? 'none'}>
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
                              ? `Solved with ${exHints} hint${exHints > 1 ? 's' : ''}`
                              : `${exHints} hint${exHints > 1 ? 's' : ''} revealed`
                          }
                        >
                          {exHints} hint{exHints > 1 ? 's' : ''}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="section-stack">
          <Card elevation={1}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag minimal intent={LEVEL_INTENT[exercise.level] ?? 'none'}>
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
              <ButtonGroup>
                <Button
                  icon="tick-circle"
                  intent="primary"
                  onClick={check}
                  text="Check my regex"
                />
                <Button
                  icon="lightbulb"
                  onClick={revealHint}
                  disabled={state.hintsRevealed >= exercise.hints.length}
                  text={`Reveal hint (${state.hintsRevealed}/${exercise.hints.length})`}
                />
                <Button
                  icon="diagram-tree"
                  onClick={() => {
                    updateState({ showDiagram: !state.showDiagram });
                  }}
                  text={state.showDiagram ? 'Hide diagram' : 'Show diagram'}
                />
                <Button
                  icon={state.showSolution ? 'eye-off' : 'eye-open'}
                  onClick={() => {
                    updateState({ showSolution: !state.showSolution });
                  }}
                  text={
                    state.showSolution ? 'Hide solution' : 'Reveal solution'
                  }
                />
                <Button icon="refresh" onClick={resetExercise} text="Reset" />
              </ButtonGroup>
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
                      Solved with {state.hintsRevealed} hint
                      {state.hintsRevealed > 1 ? 's' : ''}
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
              <Callout
                intent="primary"
                icon="lightbulb"
                title="Hints"
                style={{ marginTop: 12 }}
              >
                <ol style={{ marginTop: 4, marginBottom: 0, paddingLeft: 18 }}>
                  {exercise.hints.slice(0, state.hintsRevealed).map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ol>
              </Callout>
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
  result: TestCaseResult;
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

function FailureDetail({ result }: { result: TestCaseResult }) {
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

function testCaseKey(result: TestCaseResult): string {
  if (result.kind === 'replace') {
    return `replace::${result.testCase.text}::${result.testCase.expected}`;
  }
  return `match::${result.testCase.text}::${String(result.testCase.shouldMatch)}`;
}

function displayReplacement(replacement: string): string {
  if (replacement === '') return '(empty string)';
  return replacement;
}
