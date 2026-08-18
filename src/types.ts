export type FlagKey = 'g' | 'i' | 'm' | 's' | 'u' | 'y';

export interface FlagDescriptor {
  key: FlagKey;
  name: string;
  /** Short one-line summary shown as the tooltip headline. */
  description: string;
  /** Longer explanation of the behavior, shown below the headline. */
  detail: string;
  /** Concrete usage example: pattern, input, and what changes with the flag. */
  example: {
    pattern: string;
    input: string;
    note: string;
  };
  /** Name of the corresponding `RegExp` accessor property (e.g. `global`). */
  property: string;
}

export interface CompiledRegex {
  regex: RegExp | null;
  error: string | null;
}

export interface MatchSegment {
  text: string;
  isMatch: boolean;
  matchIndex?: number;
}

export interface MatchInfo {
  /** Whole match (substitutable with `$&`). */
  value: string;
  /** Zero-based start position of the match in the input text. */
  index: number;
  /** Text before the match (substitutable with `` $` ``). */
  prefix: string;
  /** Text after the match (substitutable with `$'`). */
  suffix: string;
  /**
   * Numbered capture groups in declaration order. A non-participating group
   * is represented as `undefined`.
   */
  groups: Array<string | undefined>;
  /**
   * Named capture groups (substitutable with `$<name>`), or `null` when the
   * pattern declares no named groups.
   */
  namedGroups: Record<string, string | undefined> | null;
}

export interface MatchResult {
  segments: MatchSegment[];
  count: number;
  matches: MatchInfo[];
}

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseKind = 'match' | 'replace';

export interface MatchTestCase {
  text: string;
  shouldMatch: boolean;
  /**
   * Optional exact expected match. When provided, the candidate regex must
   * find this exact substring (the *first* match) inside `text`.
   * @default undefined
   */
  expected?: string;
  /**
   * Optional expected values for numbered capture groups, in declaration
   * order. Entry at index `i` pins the value of `match[i + 1]`; an entry of
   * `undefined` requires that group not to participate in the match. Only
   * checked when `shouldMatch` is `true`.
   * @default undefined
   */
  expectedGroups?: Array<string | undefined>;
}

export interface ReplaceTestCase {
  /** Input text fed into `text.replace(regex, replacement)`. */
  text: string;
  /** Expected output after running the replacement. */
  expected: string;
}

interface BaseExercise {
  id: string;
  title: string;
  level: ExerciseLevel;
  description: string;
  /**
   * The sentence this exercise is indexed under, at its own address: one
   * sentence of 110 to 160 characters, in plain prose, naming the construct a
   * learner would type into a search engine.
   *
   * Separate from `description`, which teaches on the page — it is several
   * sentences long, addresses the student directly and carries `[[term]]`
   * glossary markers, none of which belongs in a search result.
   */
  metaDescription: string;
  hints: string[];
  /** Sample pattern shown only when the student reveals the solution. */
  solution: string;
  /**
   * Flags paired with `solution`, shown alongside the sample pattern when
   * the student reveals it. Not enforced by the validator — flag needs
   * must emerge naturally from the test cases.
   * @default []
   */
  solutionFlags?: FlagKey[];
}

export interface MatchExercise extends BaseExercise {
  kind: 'match';
  testCases: MatchTestCase[];
}

export interface ReplaceExercise extends BaseExercise {
  kind: 'replace';
  testCases: ReplaceTestCase[];
  /** Sample replacement string paired with `solution`. */
  solutionReplacement: string;
}

export type Exercise = MatchExercise | ReplaceExercise;

export type ExerciseStatus = 'idle' | 'attempted' | 'solved';

export interface ExerciseState {
  pattern: string;
  flags: string;
  /** Replacement string. Only used by `replace` exercises. */
  replacement: string;
  status: ExerciseStatus;
  hintsRevealed: number;
  showSolution: boolean;
  showDiagram: boolean;
}
