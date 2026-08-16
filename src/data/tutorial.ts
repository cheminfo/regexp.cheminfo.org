import type { ExerciseLevel } from '../types.ts';

import type { GlossaryEntry } from './glossary.ts';

/**
 * One stop in the guided tour. The description may contain `[[term]]` markers
 * that refer to entries in `GLOSSARY`; matching terms render as underlined
 * chips with a tooltip carrying the entry.
 *
 * When `replacement` is defined, the step is a search-and-replace example: a
 * "Replace with" input is shown to the student and the resulting text is
 * rendered underneath the matches.
 */
export interface TutorialStep {
  title: string;
  description: string;
  pattern: string;
  flags: string;
  text: string;
  /**
   * Pedagogic level used to group and color-code the step buttons.
   */
  level: ExerciseLevel;
  /**
   * Replacement string. When set, the step is a search-and-replace example.
   * @default undefined
   */
  replacement?: string;
}

/**
 * Metadata for one of the three tutorial levels. The colors are used both
 * for the group background and for the active button highlight.
 */
export interface TutorialLevelMeta {
  level: ExerciseLevel;
  label: string;
  /** Light background color applied to the group container. */
  background: string;
  /** Slightly darker color used for the currently selected step. */
  activeBackground: string;
}

export const TUTORIAL_LEVELS: TutorialLevelMeta[] = [
  {
    level: 'beginner',
    label: 'Basics',
    background: '#d1fae5',
    activeBackground: '#6ee7b7',
  },
  {
    level: 'intermediate',
    label: 'Search & replace',
    background: '#fef3c7',
    activeBackground: '#fcd34d',
  },
  {
    level: 'advanced',
    label: 'Advanced features',
    background: '#fce7f3',
    activeBackground: '#f9a8d4',
  },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    level: 'beginner',
    title: 'Literal characters match themselves',
    description:
      'The simplest regex is a sequence of [[literal characters]]. /cat/ matches the substring "cat" anywhere it appears.',
    pattern: 'cat',
    flags: 'g',
    text: 'the cat sat on the mat',
  },
  {
    level: 'beginner',
    title: 'Special characters need escaping',
    description: String.raw`Characters like . * + ? ( ) [ ] { } have a special meaning. [[Escape]] them with \ to match them literally — for example \. matches a dot.`,
    pattern: String.raw`\.`,
    flags: 'g',
    text: 'Hello. World. How are you?',
  },
  {
    level: 'beginner',
    title: 'Character classes',
    description:
      '[[Character classes]] are written in square brackets. [aeiou] matches one vowel. Use - for [[ranges]] and ^ at the start to negate.',
    pattern: '[aeiou]',
    flags: 'g',
    text: 'The quick brown fox',
  },
  {
    level: 'beginner',
    title: 'Predefined shortcuts',
    description: String.raw`\d is a digit, \w is a [[word character]] (letters, digits, underscore), \s is whitespace. Their uppercase versions are the negation.`,
    pattern: String.raw`\d+`,
    flags: 'g',
    text: 'Room 42 is on floor 7, near room 101.',
  },
  {
    level: 'beginner',
    title: 'Quantifiers',
    description:
      'A [[quantifier]] applies to the character or group before it. * means 0 or more, + means 1 or more, ? means optional, {n,m} between n and m. By default quantifiers are [[greedy]].',
    pattern: 'a+',
    flags: 'g',
    text: 'ba, baa, baaaa, b, banana!',
  },
  {
    level: 'beginner',
    title: 'Anchors',
    description: String.raw`[[Anchors]]: ^ matches the start, $ the end. With the m flag they apply to each line. \b is a [[word boundary]].`,
    pattern: String.raw`^\w+`,
    flags: 'gm',
    text: 'First line\nSecond line\nThird line',
  },
  {
    level: 'intermediate',
    title: 'Groups and alternation',
    description:
      '[[Groups]] are parentheses that group atoms together. Inside them, | means [[alternation]]. The group is also [[captured]] and accessible as $1, $2, … in replacements.',
    pattern: '(cat|dog)',
    flags: 'g',
    text: 'I have a cat and a dog, also a parrot.',
  },
  {
    level: 'intermediate',
    title: 'Replace: substitute every match',
    description:
      'The [[replacement string]] takes every match and rewrites it. Use $& to insert the whole match. Here we wrap every number in brackets.',
    pattern: String.raw`\d+`,
    flags: 'g',
    text: 'Order 42 cost 99 USD, shipped via truck 7.',
    replacement: '[$&]',
  },
  {
    level: 'intermediate',
    title: 'Replace with capture groups',
    description:
      'A [[capturing group]] remembers what it matched. In the [[replacement string]], $1 refers to the first group, $2 to the second, and so on — perfect for reordering pieces.',
    pattern: String.raw`(\w+)\s+(\w+)`,
    flags: 'g',
    text: 'John Doe, Jane Smith, Alan Turing',
    replacement: '$2 $1',
  },
  {
    level: 'intermediate',
    title: 'Non-capturing groups',
    description:
      'Sometimes you need to group atoms (e.g. to apply | or a quantifier) without creating a numbered capture. Use [[non-capturing group]] (?:...) — it groups but does not capture, so $1 refers to the *next* real group.',
    pattern: String.raw`(?:Mr|Mrs|Ms)\.\s+(\w+)`,
    flags: 'g',
    text: 'Mr. Smith, Mrs. Jones, Ms. Lee called.',
    replacement: '$1',
  },
  {
    level: 'advanced',
    title: 'Named capture groups',
    description:
      'Give a group a name with (?<name>...) — a [[named capture group]]. In the replacement, refer to it with $<name>. Names make complex replacements far easier to read than $1, $2, $3.',
    pattern: String.raw`(?<first>\w+)\s+(?<last>\w+)`,
    flags: 'g',
    text: 'John Doe, Jane Smith, Alan Turing',
    replacement: '$<last>, $<first>',
  },
  {
    level: 'advanced',
    title: 'Backreferences inside the pattern',
    description: String.raw`A [[backreference]] like \1 or \2 refers back to a previous group *within the same pattern*. Useful to detect repeated words or matching tags. Combine with the i flag to ignore case.`,
    pattern: String.raw`\b(\w+)\s+\1\b`,
    flags: 'gi',
    text: 'This this is a test. The the duplicates duplicates are found.',
  },
  {
    level: 'advanced',
    title: 'Lookaround',
    description:
      '[[Lookahead]] (?=...) and [[lookbehind]] (?<=...) let you assert what surrounds the match without including it. Negative versions: (?!...) and (?<!...).',
    pattern: String.raw`\d+(?= USD)`,
    flags: 'g',
    text: 'A: 42 USD, B: 99 EUR, C: 1000 USD',
  },
];

/**
 * Help shown when hovering the "Try it" panel header in the tutorial.
 */
export const TRY_IT_HELP: GlossaryEntry = {
  title: 'How to use the playground',
  summary:
    'Type a regex between the slashes, edit the flags on the right, and change the test text below. Matches refresh live in the panels on the right.',
  examples: [
    {
      pattern: 'g',
      note: 'Without the g flag, only the first match is found. Click the chips below to toggle flags.',
    },
    {
      pattern: 'i',
      note: 'Make the match case-insensitive — /cat/i matches "Cat", "CAT", etc.',
    },
    {
      pattern: 'm',
      note: 'Multiline: ^ and $ apply to each line of the test text instead of the whole string.',
    },
    {
      pattern: 's',
      note: 'dotAll: . also matches newline characters.',
    },
  ],
};
