/**
 * A single example shown inside a glossary tooltip.
 */
export interface GlossaryExample {
  /** Regex snippet (without surrounding slashes). */
  pattern: string;
  /**
   * Sample text the pattern is illustrated against. Omit when the example is
   * about syntax only, not behavior.
   * @default undefined
   */
  text?: string;
  /**
   * Short explanation of what the example demonstrates.
   * @default undefined
   */
  note?: string;
}

/**
 * Rich content rendered inside a Blueprint tooltip for a glossary term or
 * for the "Try it" help icon.
 */
export interface GlossaryEntry {
  title: string;
  summary: string;
  examples: GlossaryExample[];
}

/**
 * Keyed by the literal term used inside `[[...]]` markers in step descriptions.
 * Keys are lowercase; lookups should also lowercase the marker text.
 */
export const GLOSSARY: Record<string, GlossaryEntry> = {
  'literal characters': {
    title: 'Literal characters',
    summary: String.raw`Most characters in a regex match themselves exactly. Letters, digits and underscore have no special meaning by themselves. The exceptions are the metacharacters . * + ? ( ) [ ] { } | ^ $ \ — they need a backslash to match literally.`,
    examples: [
      { pattern: 'cat', text: 'the cat sat on the mat' },
      { pattern: 'Hello', text: 'Hello, world!' },
    ],
  },
  escape: {
    title: 'Escaping',
    summary:
      'A backslash \\ turns a special character into a literal one. The metacharacters that need escaping outside a class are: . * + ? ( ) [ ] { } | ^ $ \\',
    examples: [
      {
        pattern: String.raw`\.`,
        text: 'Hello. World.',
        note: 'Matches the dot character — not "any character".',
      },
      {
        pattern: String.raw`\(\)`,
        text: 'a (b) c',
        note: 'Matches literal parentheses.',
      },
    ],
  },
  'character classes': {
    title: 'Character classes',
    summary:
      'Square brackets define a set of characters. The regex matches one character from the set.',
    examples: [
      {
        pattern: '[aeiou]',
        text: 'apple',
        note: 'Matches each vowel separately.',
      },
      {
        pattern: '[a-zA-Z]',
        text: 'Hello123',
        note: 'Two ranges combined inside one class.',
      },
      {
        pattern: '[^0-9]',
        text: 'a1b2',
        note: 'Caret at the start negates — matches anything except a digit.',
      },
    ],
  },
  ranges: {
    title: 'Ranges',
    summary:
      'Inside a character class, a-z denotes every character between a and z in code-point order.',
    examples: [
      { pattern: '[0-9]', text: 'item42', note: String.raw`Same as \d.` },
      { pattern: '[a-fA-F]', text: 'CafeFace', note: 'Hex letters.' },
    ],
  },
  'word character': {
    title: String.raw`Word character (\w)`,
    summary: String.raw`Matches a letter, digit, or underscore — equivalent to [A-Za-z0-9_]. The uppercase \W matches the opposite.`,
    examples: [
      {
        pattern: String.raw`\w+`,
        text: 'foo_bar 42!',
        note: 'Greedily grabs a "word".',
      },
      {
        pattern: String.raw`\W`,
        text: 'a@b c',
        note: 'Matches each non-word character.',
      },
    ],
  },
  quantifier: {
    title: 'Quantifiers',
    summary:
      'Apply to the preceding atom and control how many times it can repeat.',
    examples: [
      { pattern: 'a+', text: 'baaa', note: '+ → 1 or more.' },
      { pattern: 'a*', text: 'b a', note: '* → 0 or more.' },
      { pattern: 'a?', text: 'ba', note: '? → optional (0 or 1).' },
      { pattern: 'a{2,4}', text: 'aaaaa', note: '{n,m} → between n and m.' },
    ],
  },
  greedy: {
    title: 'Greedy vs lazy',
    summary:
      'Quantifiers are greedy by default — they grab as much as possible. Add ? after a quantifier to make it lazy and take the shortest match.',
    examples: [
      {
        pattern: 'a.+b',
        text: 'a1b a2b',
        note: 'Greedy: matches the whole "a1b a2b".',
      },
      {
        pattern: 'a.+?b',
        text: 'a1b a2b',
        note: 'Lazy: stops at the first "b".',
      },
    ],
  },
  anchors: {
    title: 'Anchors',
    summary:
      'Match positions, not characters. They consume no input — they only assert where the engine is.',
    examples: [
      {
        pattern: '^The',
        text: 'The cat\nThen the dog',
        note: '^ — start of string (or line with the m flag).',
      },
      {
        pattern: 'end$',
        text: 'the end',
        note: '$ — end of string (or line with the m flag).',
      },
    ],
  },
  'word boundary': {
    title: String.raw`Word boundary (\b)`,
    summary: String.raw`Zero-width position between a word character (\w) and a non-word character — also at the start and end of the string.`,
    examples: [
      {
        pattern: String.raw`\bcat\b`,
        text: 'cat scatter category',
        note: 'Only the standalone "cat" matches.',
      },
      {
        pattern: String.raw`\bword`,
        text: 'sword wordy',
        note: 'Matches "word" only at the start of a word.',
      },
    ],
  },
  groups: {
    title: 'Groups',
    summary:
      'Parentheses group atoms so a quantifier or | can apply to the whole sub-pattern. They also capture the match by default.',
    examples: [
      {
        pattern: '(ab)+',
        text: 'ababab',
        note: 'Quantifier applies to the whole "ab".',
      },
      {
        pattern: '(?:ab)+',
        text: 'ababab',
        note: 'Non-capturing variant — same match, no group stored.',
      },
    ],
  },
  alternation: {
    title: 'Alternation',
    summary:
      'The | operator separates alternatives. Combine with parentheses to limit its scope.',
    examples: [
      {
        pattern: 'cat|dog',
        text: 'I have a cat and a dog',
        note: 'Matches "cat" or "dog".',
      },
      {
        pattern: '^(yes|no)$',
        text: 'yes',
        note: 'Restrict alternation to whole-line values.',
      },
    ],
  },
  captured: {
    title: 'Capturing groups',
    summary: String.raw`Parentheses remember their match. Refer back to it as \1, \2, ... inside the pattern, or as $1, $2, ... in replacements.`,
    examples: [
      {
        pattern: String.raw`(\w+)\s\1`,
        text: 'the the cat',
        note: String.raw`Backreference \1 = same text the group matched.`,
      },
      {
        pattern: String.raw`(?<name>\w+)`,
        text: 'Alice',
        note: 'Named group — accessible as $<name> in replacements.',
      },
    ],
  },
  lookahead: {
    title: 'Lookahead',
    summary:
      '(?=...) succeeds only if what follows matches, without consuming it. Use (?!...) for negative lookahead.',
    examples: [
      {
        pattern: String.raw`\d+(?= USD)`,
        text: '42 USD, 99 EUR',
        note: 'Captures the digits only — " USD" is not consumed.',
      },
      {
        pattern: String.raw`\d+(?! USD)`,
        text: '42 USD, 99 EUR',
        note: 'Negative: matches digits NOT followed by " USD".',
      },
    ],
  },
  lookbehind: {
    title: 'Lookbehind',
    summary:
      '(?<=...) succeeds only if what precedes matches, without consuming it. Use (?<!...) for negative lookbehind.',
    examples: [
      {
        pattern: String.raw`(?<=\$)\d+`,
        text: 'price $42',
        note: 'Captures digits preceded by $.',
      },
      {
        pattern: String.raw`(?<!\$)\d+`,
        text: '$42 has 17 in change',
        note: 'Negative: matches digits NOT preceded by $.',
      },
    ],
  },
  'replacement string': {
    title: 'Replacement string',
    summary:
      "The second argument to text.replace(regex, …). Most characters are inserted as-is. A few sequences are substituted: $& for the whole match, $` and $' for the text before/after the match, $1..$9 for capture groups, $<name> for named groups, $$ for a literal dollar sign.",
    examples: [
      {
        pattern: String.raw`\d+`,
        text: 'order 42',
        note: 'Replacement "[$&]" → "order [42]". $& is the whole match.',
      },
      {
        pattern: String.raw`(\w+)\s(\w+)`,
        text: 'John Doe',
        note: 'Replacement "$2 $1" → "Doe John" — swaps the two captures.',
      },
    ],
  },
  'capturing group': {
    title: 'Capturing groups',
    summary: String.raw`Parentheses remember their match. Refer back to them as \1, \2, … inside the pattern, or as $1, $2, … in replacements.`,
    examples: [
      {
        pattern: String.raw`(\d+)-(\d+)`,
        text: '2025-11',
        note: '$1 = "2025", $2 = "11".',
      },
      {
        pattern: String.raw`(\w+)\s\1`,
        text: 'the the cat',
        note: String.raw`Backreference \1 = same text the group matched.`,
      },
    ],
  },
  'non-capturing group': {
    title: 'Non-capturing group',
    summary:
      '(?:...) groups atoms together — so | or a quantifier applies to the whole sub-pattern — without creating a numbered capture. Use it when you need the grouping but not the capture, to keep $1, $2, … aligned with the groups you actually care about.',
    examples: [
      {
        pattern: '(?:cat|dog)s?',
        text: 'cats and dogs',
        note: 'Group the alternation without capturing it.',
      },
      {
        pattern: String.raw`(?:Mr|Mrs)\.\s+(\w+)`,
        text: 'Mr. Smith',
        note: '$1 is "Smith" — the title is grouped but not captured.',
      },
    ],
  },
  'named capture group': {
    title: 'Named capture groups',
    summary:
      '(?<name>...) gives the captured text a name. In replacements, refer to it with $<name>; in matched results, it appears on the `groups` object. Names make complex patterns far more readable than numbered groups.',
    examples: [
      {
        pattern: String.raw`(?<year>\d{4})-(?<month>\d{2})`,
        text: '2025-11',
        note: 'Access via groups.year, groups.month.',
      },
      {
        pattern: String.raw`(?<first>\w+)\s+(?<last>\w+)`,
        text: 'Alan Turing',
        note: 'Replacement "$<last>, $<first>" → "Turing, Alan".',
      },
    ],
  },
  backreference: {
    title: 'Backreference',
    summary: String.raw`\1, \2, … reuse the exact text captured earlier in the same pattern. Useful for detecting duplicates, matching paired tags or quoted strings.`,
    examples: [
      {
        pattern: String.raw`\b(\w+)\s+\1\b`,
        text: 'the the cat',
        note: 'Detect a repeated word.',
      },
      {
        pattern: String.raw`(['"]).+?\1`,
        text: `He said "hi" then 'bye'`,
        note: 'Match a string quoted with the same kind of quote.',
      },
    ],
  },
};
