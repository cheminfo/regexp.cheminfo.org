import type { Exercise } from '../types.ts';

export const EXERCISES: Exercise[] = [
  {
    id: 'literal-hello',
    kind: 'match',
    title: 'Match the word "hello"',
    level: 'beginner',
    description:
      'Write a regular expression that matches the exact word "hello" (lowercase). For now we are testing whether the regex finds the word anywhere in the text.',
    testCases: [
      { text: 'hello world', shouldMatch: true, expected: 'hello' },
      { text: 'oh, hello!', shouldMatch: true, expected: 'hello' },
      { text: 'hi there', shouldMatch: false },
      { text: 'HELLO', shouldMatch: false },
    ],
    hints: [
      'A regex made of plain letters matches those exact letters.',
      'The regex /hello/ matches the substring "hello".',
    ],
    solution: 'hello',
  },
  {
    id: 'case-insensitive-hello',
    kind: 'match',
    title: 'Match "hello" — any casing',
    level: 'beginner',
    description:
      'Match the word "hello" regardless of its capitalization. Hint: there is a flag for this.',
    solutionFlags: ['i'],
    testCases: [
      { text: 'hello world', shouldMatch: true, expected: 'hello' },
      { text: 'HELLO!', shouldMatch: true, expected: 'HELLO' },
      { text: 'Hello there', shouldMatch: true, expected: 'Hello' },
      { text: 'goodbye', shouldMatch: false },
    ],
    hints: ['The "i" flag makes matching case-insensitive.', 'Try /hello/i.'],
    solution: 'hello',
  },
  {
    id: 'digit',
    kind: 'match',
    title: 'Find any digit',
    level: 'beginner',
    description: 'Match a single digit (0–9).',
    testCases: [
      { text: 'abc 7 def', shouldMatch: true, expected: '7' },
      { text: 'order #42', shouldMatch: true, expected: '4' },
      { text: 'no numbers here', shouldMatch: false },
    ],
    hints: [
      String.raw`The shorthand \d matches a single digit.`,
      'Equivalent to [0-9].',
    ],
    solution: String.raw`\d`,
  },
  {
    id: 'three-digits',
    kind: 'match',
    title: 'Match three consecutive digits',
    level: 'beginner',
    description:
      'Match a sequence of exactly three digits. Useful for area codes, for example.',
    testCases: [
      { text: 'call 415 now', shouldMatch: true, expected: '415' },
      { text: '12 trees and 345 birds', shouldMatch: true, expected: '345' },
      { text: 'only 42 here', shouldMatch: false },
    ],
    hints: [
      'Use a quantifier like {3} to require an exact count.',
      String.raw`Try \d{3}.`,
    ],
    solution: String.raw`\d{3}`,
  },
  {
    id: 'word-boundary-cat',
    kind: 'match',
    title: 'Match the word "cat" but not "category"',
    level: 'intermediate',
    description:
      'Make sure your regex only matches the word "cat" on its own — not as part of a longer word like "category" or "scatter".',
    testCases: [
      { text: 'the cat sleeps', shouldMatch: true, expected: 'cat' },
      { text: 'category list', shouldMatch: false },
      { text: 'scatter the pieces', shouldMatch: false },
      { text: 'a cat.', shouldMatch: true, expected: 'cat' },
    ],
    hints: [
      String.raw`Word boundaries are denoted by \b.`,
      String.raw`Use \bcat\b.`,
    ],
    solution: String.raw`\bcat\b`,
  },
  {
    id: 'simple-email',
    kind: 'match',
    title: 'Capture a simple email address',
    level: 'intermediate',
    description:
      'Match a simple email of the form user@domain.tld. You can stay with letters, digits, dots, hyphens and underscores.',
    testCases: [
      {
        text: 'contact me at foo@bar.com',
        shouldMatch: true,
        expected: 'foo@bar.com',
      },
      {
        text: 'a.b_c@example.org',
        shouldMatch: true,
        expected: 'a.b_c@example.org',
      },
      { text: 'just plain text', shouldMatch: false },
      { text: 'broken @ space.com', shouldMatch: false },
    ],
    hints: [
      String.raw`Allowed name characters: [\w.-]`,
      'Put @ between two such groups, then . and the tld.',
      String.raw`Try [\w.-]+@[\w.-]+\.\w{2,}.`,
    ],
    solution: String.raw`[\w.-]+@[\w.-]+\.\w{2,}`,
  },
  {
    id: 'iso-date',
    kind: 'match',
    title: 'Match an ISO date (YYYY-MM-DD)',
    level: 'intermediate',
    description:
      'Match a date in YYYY-MM-DD format. You do not need to validate that the date is real — just the shape.',
    testCases: [
      {
        text: 'on 2024-01-31 we shipped',
        shouldMatch: true,
        expected: '2024-01-31',
      },
      {
        text: 'today is 1999-12-09',
        shouldMatch: true,
        expected: '1999-12-09',
      },
      { text: '31/01/2024', shouldMatch: false },
      { text: 'meeting tomorrow', shouldMatch: false },
    ],
    hints: [
      'Year is 4 digits, month and day are 2 digits each.',
      String.raw`Use \d{N} and dashes between them.`,
      String.raw`Try \d{4}-\d{2}-\d{2}.`,
    ],
    solution: String.raw`\d{4}-\d{2}-\d{2}`,
  },
  {
    id: 'hex-color',
    kind: 'match',
    title: 'Match a hex colour',
    level: 'intermediate',
    description:
      'Match a CSS hex colour like #1e3a8a or #fff. It always starts with # followed by exactly 3 or 6 hex digits.',
    testCases: [
      {
        text: 'background #1e3a8a is nice',
        shouldMatch: true,
        expected: '#1e3a8a',
      },
      { text: 'use #fff or #FFFFFF', shouldMatch: true, expected: '#fff' },
      { text: '#12345 is invalid', shouldMatch: false },
      { text: 'plain text', shouldMatch: false },
    ],
    hints: [
      'Hex digits are [0-9a-fA-F].',
      'Use alternation: either 6 or 3 digits.',
      String.raw`Try the longer alternative first, and use \b to reject e.g. #12345.`,
      String.raw`Try #(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b.`,
    ],
    solution: String.raw`#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b`,
  },
  {
    id: 'capture-group-name',
    kind: 'match',
    title: 'Capture first name from "Hello, NAME!"',
    level: 'intermediate',
    description:
      'Use a capturing group to capture only the name in greetings like "Hello, Alice!". The full match must be the whole greeting (so a plain "Hi Alice!" is rejected), and group 1 must contain just the name.',
    testCases: [
      {
        text: 'Hello, Alice!',
        shouldMatch: true,
        expected: 'Hello, Alice!',
        expectedGroups: ['Alice'],
      },
      {
        text: 'Hello, Bob!',
        shouldMatch: true,
        expected: 'Hello, Bob!',
        expectedGroups: ['Bob'],
      },
      { text: 'Hi Alice!', shouldMatch: false },
    ],
    hints: [
      'Use parentheses (...) to capture.',
      'A name is a sequence of word characters.',
      String.raw`Try Hello, (\w+)!.`,
    ],
    solution: String.raw`Hello, (\w+)!`,
  },
  {
    id: 'lookahead-price',
    kind: 'match',
    title: 'Match a number followed by " USD"',
    level: 'advanced',
    description:
      'Match the number, but only when it is followed by " USD". The match must contain only the digits, not the currency.',
    testCases: [
      { text: 'total 42 USD', shouldMatch: true, expected: '42' },
      { text: '1000 USD please', shouldMatch: true, expected: '1000' },
      { text: '42 EUR', shouldMatch: false },
      { text: 'no number here', shouldMatch: false },
    ],
    hints: [
      'Use a positive lookahead (?=...) to check what comes after.',
      String.raw`Try \d+(?= USD).`,
    ],
    solution: String.raw`\d+(?= USD)`,
  },
  {
    id: 'duplicate-word',
    kind: 'match',
    title: 'Find a duplicate word',
    level: 'advanced',
    description:
      'Match any word that is immediately repeated — for instance "the the" or "The THE". Use a backreference so you do not have to hardcode the word, and make the match case-insensitive so different casings still count as a repetition.',
    testCases: [
      {
        text: 'this is the the test',
        shouldMatch: true,
        expected: 'the the',
        expectedGroups: ['the'],
      },
      { text: 'all good here', shouldMatch: false },
      {
        text: 'I I think so',
        shouldMatch: true,
        expected: 'I I',
        expectedGroups: ['I'],
      },
      {
        text: 'The THE building',
        shouldMatch: true,
        expected: 'The THE',
        expectedGroups: ['The'],
      },
    ],
    hints: [
      String.raw`Use a capturing group for a word: (\w+).`,
      String.raw`Then refer to it again with \1 after a space.`,
      'A backreference is case-sensitive by default — add a flag to ignore case.',
      String.raw`Try \b(\w+) \1\b with the i flag.`,
    ],
    solution: String.raw`\b(\w+) \1\b`,
    solutionFlags: ['i'],
  },
  {
    id: 'replace-redact-digits',
    kind: 'replace',
    title: 'Redact every digit',
    level: 'beginner',
    description:
      'Replace every digit in the text with a "#" character. Be sure to replace all of them, not just the first one.',
    solutionFlags: ['g'],
    testCases: [
      { text: 'Room 42, floor 7', expected: 'Room ##, floor #' },
      { text: 'no digits here', expected: 'no digits here' },
      { text: 'pi ≈ 3.14159', expected: 'pi ≈ #.#####' },
    ],
    hints: [
      String.raw`\d matches one digit.`,
      'Without the g flag, only the first digit is replaced.',
      String.raw`Pattern \d with replacement "#" and flag g.`,
    ],
    solution: String.raw`\d`,
    solutionReplacement: '#',
  },
  {
    id: 'replace-collapse-spaces',
    kind: 'replace',
    title: 'Collapse runs of whitespace',
    level: 'beginner',
    description:
      'Turn any run of one-or-more whitespace characters into a single space. Tabs and multiple spaces should all become exactly one space.',
    solutionFlags: ['g'],
    testCases: [
      { text: 'hello   world', expected: 'hello world' },
      { text: 'a\t\tb  c', expected: 'a b c' },
      { text: 'single spaces stay', expected: 'single spaces stay' },
    ],
    hints: [
      String.raw`\s matches one whitespace character (space, tab, newline).`,
      'Use the + quantifier to match one or more.',
      String.raw`Pattern \s+ with replacement " " (a single space) and flag g.`,
    ],
    solution: String.raw`\s+`,
    solutionReplacement: ' ',
  },
  {
    id: 'replace-swap-names',
    kind: 'replace',
    title: 'Swap "First Last" to "Last, First"',
    level: 'intermediate',
    description:
      'Reformat full names from "First Last" to "Last, First" using two capturing groups and backreferences in the replacement.',
    testCases: [
      { text: 'Marie Curie', expected: 'Curie, Marie' },
      { text: 'Alan Turing', expected: 'Turing, Alan' },
    ],
    hints: [
      'Use two capturing groups, one for each name.',
      'In the replacement, refer to them with $1 and $2.',
      String.raw`Try pattern (\w+) (\w+) with replacement $2, $1.`,
    ],
    solution: String.raw`(\w+) (\w+)`,
    solutionReplacement: '$2, $1',
  },
  {
    id: 'replace-reformat-date',
    kind: 'replace',
    title: 'Reformat ISO date to DD/MM/YYYY',
    level: 'intermediate',
    description:
      'Convert ISO dates (YYYY-MM-DD) into European-style DD/MM/YYYY using three capturing groups.',
    solutionFlags: ['g'],
    testCases: [
      { text: '2024-01-31', expected: '31/01/2024' },
      {
        text: 'from 1999-12-09 to 2001-03-04',
        expected: 'from 09/12/1999 to 04/03/2001',
      },
      { text: 'no dates here', expected: 'no dates here' },
    ],
    hints: [
      'Capture year, month and day separately.',
      'Reorder them in the replacement with $3/$2/$1.',
      String.raw`Try (\d{4})-(\d{2})-(\d{2}) with replacement $3/$2/$1.`,
    ],
    solution: String.raw`(\d{4})-(\d{2})-(\d{2})`,
    solutionReplacement: '$3/$2/$1',
  },
  {
    id: 'replace-trim-trailing-spaces',
    kind: 'replace',
    title: 'Trim trailing spaces on every line',
    level: 'intermediate',
    description:
      'Remove any trailing spaces or tabs at the end of each line, without touching blank lines that are already empty.',
    solutionFlags: ['g', 'm'],
    testCases: [
      { text: 'hello   \nworld\t', expected: 'hello\nworld' },
      { text: 'clean\nlines', expected: 'clean\nlines' },
      { text: 'trail  \n\nstill   ', expected: 'trail\n\nstill' },
    ],
    hints: [
      String.raw`Use [ \t]+ to match one or more spaces or tabs.`,
      'Anchor to end-of-line with $ — and add the m flag so $ means each line.',
      String.raw`Try [ \t]+$ with the gm flags and an empty replacement.`,
    ],
    solution: String.raw`[ \t]+$`,
    solutionReplacement: '',
  },
  {
    id: 'replace-wrap-emails',
    kind: 'replace',
    title: 'Wrap each email in <…>',
    level: 'intermediate',
    description:
      'Surround every email address in the text with angle brackets. Use $& in the replacement to refer to the whole match.',
    solutionFlags: ['g'],
    testCases: [
      {
        text: 'write to foo@bar.com or baz@qux.org',
        expected: 'write to <foo@bar.com> or <baz@qux.org>',
      },
      { text: 'no email here', expected: 'no email here' },
      {
        text: 'reach support-team@my-site.org for help',
        expected: 'reach <support-team@my-site.org> for help',
      },
      {
        text: 'visit example.com or test.org — no emails',
        expected: 'visit example.com or test.org — no emails',
      },
    ],
    hints: [
      'Reuse the email pattern from the matching exercise.',
      'In the replacement, $& stands for the entire match.',
      String.raw`Try [\w.-]+@[\w.-]+\.\w{2,} with replacement <$&>.`,
    ],
    solution: String.raw`[\w.-]+@[\w.-]+\.\w{2,}`,
    solutionReplacement: '<$&>',
  },
  {
    id: 'replace-named-groups-date',
    kind: 'replace',
    title: 'Reformat date using named groups',
    level: 'advanced',
    description:
      'Same as the date-reformat exercise, but use named capturing groups and refer to them in the replacement with $<name> syntax.',
    testCases: [
      { text: '2024-01-31', expected: '31/01/2024' },
      {
        text: 'meet on 2025-06-15 please',
        expected: 'meet on 15/06/2025 please',
      },
      {
        text: 'sprint 2025-06-15 to 2025-06-22',
        expected: 'sprint 15/06/2025 to 22/06/2025',
      },
    ],
    hints: [
      String.raw`Named groups: (?<year>\d{4}).`,
      'Reference them in the replacement with $<year>.',
      String.raw`Try (?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) with $<day>/$<month>/$<year>.`,
    ],
    solution: String.raw`(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})`,
    solutionFlags: ['g'],
    solutionReplacement: '$<day>/$<month>/$<year>',
  },
  {
    id: 'replace-strip-tags',
    kind: 'replace',
    title: 'Strip simple HTML tags',
    level: 'advanced',
    description:
      'Remove every HTML tag, keeping only the surrounding text. Match the smallest possible tag — beware of greedy quantifiers across multiple tags.',
    solutionFlags: ['g'],
    testCases: [
      {
        text: '<p>Hello <b>world</b></p>',
        expected: 'Hello world',
      },
      {
        text: '<a href="x">link</a> and <i>more</i>',
        expected: 'link and more',
      },
      { text: 'no tags here', expected: 'no tags here' },
    ],
    hints: [
      'A tag starts with < and ends with >.',
      'Inside the tag, match anything except > — that is [^>]*.',
      'Try <[^>]*> with an empty replacement and flag g.',
    ],
    solution: '<[^>]*>',
    solutionReplacement: '',
  },
];
