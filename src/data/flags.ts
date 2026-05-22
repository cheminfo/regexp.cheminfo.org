import type { FlagDescriptor } from '../types.ts';

export const FLAGS: FlagDescriptor[] = [
  {
    key: 'g',
    name: 'global',
    property: 'global',
    description: 'Find all matches in the input',
    detail:
      'Without g, methods like String.prototype.match() return only the first match. With g, match() returns every occurrence, replace() rewrites them all, and stateful methods (exec, test) advance lastIndex on each call.',
    example: {
      pattern: '/cat/g',
      input: 'cat and cat',
      note: 'matches both "cat" occurrences (count = 2). Without g, only the first is returned.',
    },
  },
  {
    key: 'i',
    name: 'ignoreCase',
    property: 'ignoreCase',
    description: 'Case-insensitive matching',
    detail:
      'Letters in the pattern match both upper- and lower-case versions in the input. Combined with the u flag, case-folding follows the full Unicode rules (e.g. ß ↔ SS).',
    example: {
      pattern: '/cat/i',
      input: 'The Cat sat on the MAT',
      note: 'matches "Cat" (and would match "CAT", "cAt", …).',
    },
  },
  {
    key: 'm',
    name: 'multiline',
    property: 'multiline',
    description: '^ and $ anchor to each line',
    detail:
      'Treats the input as multiple lines separated by line terminators. The anchors ^ and $ then match at the start/end of every line instead of only at the start/end of the whole string. The . metacharacter is unaffected — use the s flag for that.',
    example: {
      pattern: '/^cat/gm',
      input: 'cat\nand cat\ncat again',
      note: 'matches "cat" at the start of line 1 and line 3, but not the "cat" in the middle of line 2.',
    },
  },
  {
    key: 's',
    name: 'dotAll',
    property: 'dotAll',
    description: '. matches newline characters',
    detail: String.raw`By default the dot . matches any character except line terminators (\n, \r, U+2028, U+2029). With s, the dot matches those too — useful when scanning blocks of text that may span multiple lines.`,
    example: {
      pattern: String.raw`/<p>.*<\/p>/s`,
      input: '<p>line one\nline two</p>',
      note: 'matches the whole paragraph including the newline. Without s, the match would fail.',
    },
  },
  {
    key: 'u',
    name: 'unicode',
    property: 'unicode',
    description: 'Full Unicode mode',
    detail: String.raw`Treats the pattern as a sequence of Unicode code points rather than UTF-16 code units. Enables \u{1F600}-style code-point escapes, the \p{…} / \P{…} Unicode property classes, surrogate-pair-aware matching, and stricter syntax (lone backslashes and unknown escapes throw).`,
    example: {
      pattern: String.raw`/\p{Letter}+/gu`,
      input: 'café 你好 🐱',
      note: String.raw`matches "café" and "你好" as letters across scripts. \p{…} requires u (or v).`,
    },
  },
  {
    key: 'y',
    name: 'sticky',
    property: 'sticky',
    description: 'Anchor matches at lastIndex',
    detail:
      'A sticky regex only matches at the exact position given by regex.lastIndex, never further along the string. After a successful match, lastIndex advances to the end of the match — ideal for hand-written tokenizers/lexers that walk the input one token at a time.',
    example: {
      pattern: '/foo/y',
      input: '  foo',
      note: 'fails at position 0 because the input starts with spaces; would succeed only if lastIndex is set to 2.',
    },
  },
];
